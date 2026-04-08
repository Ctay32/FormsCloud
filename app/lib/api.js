import { supabase } from './supabase.js'
import { auth } from './auth.js'

// Form CRUD operations
export const formsApi = {
  // Récupérer tous les formulaires de l'utilisateur connecté
  async getAll() {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    const { data: forms, error } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error

    if (!forms || forms.length === 0) {
      return []
    }

    const formIds = forms.map((form) => form.id)

    const [questionsResult, responsesResult] = await Promise.all([
      supabase
        .from('questions')
        .select('id, form_id')
        .in('form_id', formIds),
      supabase
        .from('responses')
        .select('id, form_id')
        .in('form_id', formIds)
    ])

    if (questionsResult.error) throw questionsResult.error
    if (responsesResult.error) throw responsesResult.error

    const questionCounts = (questionsResult.data || []).reduce((counts, question) => {
      counts[question.form_id] = (counts[question.form_id] || 0) + 1
      return counts
    }, {})

    const responseCounts = (responsesResult.data || []).reduce((counts, response) => {
      counts[response.form_id] = (counts[response.form_id] || 0) + 1
      return counts
    }, {})

    return forms.map(form => ({
      ...form,
      questionsCount: questionCounts[form.id] || 0,
      responses: responseCounts[form.id] || 0,
      date: new Date(form.created_at).toLocaleDateString('fr-FR')
    }))
  },

  // Récupérer un formulaire par ID (vérifier que l'utilisateur est le propriétaire)
  async getById(id) {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    const { data, error } = await supabase
      .from('forms')
      .select(`
        *,
        questions(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  // Créer un nouveau formulaire pour l'utilisateur connecté
  async create(formData) {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    // Créer le formulaire
    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert([{
        title: formData.title,
        description: formData.description,
        user_id: user.id
      }])
      .select()
      .single()
    
    if (formError) throw formError

    // Créer les questions
    if (formData.questions && formData.questions.length > 0) {
      const questionsData = formData.questions
        .filter(q => q.text.trim())
        .map((question, index) => {
          const questionData = {
            form_id: form.id,
            text: question.text,
            type: question.type || 'short_answer',
            order_index: index,
            required: question.required || false,
            user_id: user.id
          }
          
          // Ajouter les options si elles existent
          if (question.options && question.options.length > 0) {
            questionData.options = question.options
          }
          
          // Ajouter les settings pour les types avancés
          if (question.type === 'linear_scale') {
            questionData.settings = {
              scaleStart: question.scaleStart,
              scaleEnd: question.scaleEnd,
              scaleSteps: question.scaleSteps
            }
          } else if (question.type === 'grid') {
            questionData.settings = {
              gridData: question.gridData
            }
          } else if (question.type === 'number') {
            questionData.settings = {
              min: question.min,
              max: question.max,
              precision: question.precision
            }
          }
          
          return questionData
        })

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsData)
      
      if (questionsError) throw questionsError
    }

    return form
  },

  // Supprimer un formulaire (vérifier que l'utilisateur est le propriétaire)
  async delete(id) {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }
}

// Response operations
export const responsesApi = {
  // Soumettre une réponse (publique - tout le monde peut répondre)
  async submit(formId, answers) {
    const user = await auth.getCurrentUser()

    // Créer la réponse principale
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert([{
        form_id: formId,
        user_id: user?.id || null
      }])
      .select()
      .single()
    
    if (responseError) throw responseError

    // Créer les détails des réponses
    const responseDetails = Object.entries(answers).map(([questionId, answer]) => ({
      response_id: response.id,
      question_id: questionId,
      answer: answer
    }))

    const { error: detailsError } = await supabase
      .from('response_details')
      .insert(responseDetails)
    
    if (detailsError) throw detailsError

    return response
  },

  // Récupérer toutes les réponses pour un formulaire (vérifier que l'utilisateur est le propriétaire)
  async getByFormId(formId) {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    const { data, error } = await supabase
      .from('responses')
      .select(`
        *,
        response_details(
          question_id,
          answer,
          questions(text)
        )
      `)
      .eq('form_id', formId)
    
    if (error) throw error

    return data.map(response => ({
      id: response.id,
      submitted_at: response.submitted_at,
      date: new Date(response.submitted_at).toLocaleDateString('fr-FR'),
      responses: response.response_details.map(detail => ({
        question: detail.questions.text,
        answer: detail.answer
      }))
    }))
  },

  // Analyser les réponses (vérifier que l'utilisateur est le propriétaire)
  async getAnalysis(formId) {
    const responses = await this.getByFormId(formId)
    const analysis = {}

    responses.forEach(response => {
      response.responses.forEach(item => {
        const question = item.question
        if (!analysis[question]) {
          analysis[question] = {}
        }
        
        const answerText = item.answer.toLowerCase()
        let label = item.answer

        // Regroupement intelligent
        if (answerText.includes('excellent') || answerText.includes('très')) {
          label = 'Excellent/Très satisfait'
        } else if (answerText.includes('bon') || answerText.includes('satisfait')) {
          label = 'Bon/Satisfait'
        } else if (answerText.includes('moyen')) {
          label = 'Moyen'
        } else if (answerText.includes('mauvais')) {
          label = 'Mauvais'
        }

        analysis[question][label] = (analysis[question][label] || 0) + 1
      })
    })

    return analysis
  }
}
