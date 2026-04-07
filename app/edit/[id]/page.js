'use client'

import { useState, useEffect } from 'react'
import AdvancedQuestionInput from '../../components/AdvancedQuestionInput'
import Link from 'next/link'
import { formsApi } from '../../lib/api'
import { useRouter } from 'next/navigation'

export default function EditFormPage({ params }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([])
  const [settings, setSettings] = useState({
    collectEmail: false,
    allowMultipleSubmissions: true,
    showProgressBar: true,
    shuffleQuestions: false,
    limitTime: false,
    timeLimit: 30
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    loadForm()
  }, [params.id])

  const loadForm = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('EDIT: Chargement du formulaire pour édition:', params.id)
      
      const formData = await formsApi.getById(params.id)
      console.log('EDIT: Données du formulaire chargé:', JSON.stringify(formData, null, 2))
      
      setTitle(formData.title || '')
      setDescription(formData.description || '')
      
      if (formData.questions && formData.questions.length > 0) {
        console.log('EDIT: Questions trouvées:', formData.questions.length)
        setQuestions(formData.questions)
      } else {
        console.log('EDIT: Aucune question trouvée, création d\'une question par défaut')
        setQuestions([{ text: '', type: 'short_answer', required: false }])
      }
      
      // Charger les paramètres si existants
      if (formData.settings) {
        console.log('EDIT: Paramètres trouvés:', formData.settings)
        setSettings(formData.settings)
      }
      
      console.log('EDIT: Chargement terminé avec succès')
    } catch (err) {
      console.error('EDIT: Erreur lors du chargement du formulaire:', err)
      setError('Formulaire non trouvé ou inaccessible')
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionChange = (index, field, value) => {
    console.log('EDIT: Modification question', index, field, value)
    const updatedQuestions = [...questions]
    updatedQuestions[index][field] = value
    setQuestions(updatedQuestions)
    console.log('EDIT: Questions après modification:', JSON.stringify(updatedQuestions, null, 2))
  }

  const handleAddQuestion = () => {
    console.log('EDIT: Ajout d\'une nouvelle question')
    const newQuestion = { text: '', type: 'short_answer', required: false }
    setQuestions([...questions, newQuestion])
    console.log('EDIT: Questions après ajout:', JSON.stringify([...questions, newQuestion], null, 2))
  }

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      console.log('EDIT: Suppression question', index)
      const updatedQuestions = questions.filter((_, i) => i !== index)
      setQuestions(updatedQuestions)
      console.log('EDIT: Questions après suppression:', JSON.stringify(updatedQuestions, null, 2))
    }
  }

  const handleUpdateForm = async () => {
    console.log('EDIT: Début de la mise à jour du formulaire')
    console.log('EDIT: Questions actuelles:', JSON.stringify(questions, null, 2))
    
    // Validation
    if (!title.trim()) {
      setError('Veuillez entrer un titre pour le formulaire')
      return
    }

    const validQuestions = questions.filter(q => q.text.trim())
    console.log('EDIT: Questions valides:', validQuestions.length)
    
    if (validQuestions.length === 0) {
      setError('Veuillez ajouter au moins une question')
      return
    }

    // Validation des options pour les questions à choix
    for (const question of validQuestions) {
      if ((question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && 
          (!question.options || question.options.length === 0)) {
        setError(`La question "${question.text}" doit avoir au moins une option`)
        return
      }
    }

    try {
      setSaving(true)
      setError(null)
      
      const updateData = {
        title: title.trim(),
        description: description.trim(),
        questions: validQuestions,
        settings: settings
      }

      console.log('EDIT: Données à envoyer à l\'API:', JSON.stringify(updateData, null, 2))
      
      await formsApi.update(params.id, updateData)
      
      console.log('EDIT: Formulaire mis à jour avec succès')
      
      // Rediriger vers le dashboard
      router.push('/')
    } catch (err) {
      console.error('EDIT: Erreur lors de la mise à jour du formulaire:', err)
      console.error('EDIT: Stack trace:', err.stack)
      
      // Message d'erreur plus spécifique
      let errorMessage = 'Impossible de mettre à jour le formulaire. Veuillez réessayer.'
      
      if (err.message) {
        if (err.message.includes('duplicate')) {
          errorMessage = 'Un formulaire avec ce titre existe déjà.'
        } else if (err.message.includes('required')) {
          errorMessage = 'Des champs requis sont manquants.'
        } else if (err.message.includes('network')) {
          errorMessage = 'Erreur de connexion. Vérifiez votre internet.'
        } else {
          errorMessage = `Erreur: ${err.message}`
        }
      }
      
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    )
  }

  if (error && !title) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="card text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error}
            </h2>
            <p className="text-gray-600 mb-4">
              Le formulaire que vous cherchez n'existe pas
            </p>
            <Link href="/" className="btn-primary">
              Retour au dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-rose hover:text-rose/70 font-medium mb-4 inline-block">
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modifier le formulaire
          </h1>
          <p className="text-gray-600">
            Mettez à jour votre formulaire et ses questions
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Form info */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations générales
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du formulaire *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Satisfaction client, Sondage employés..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'objectif de votre formulaire..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Questions ({questions.length})
                </h2>
                <button
                  onClick={handleAddQuestion}
                  className="btn-primary px-6 py-3 flex items-center gap-2 text-base font-medium shadow-lg hover:shadow-xl transition-shadow"
                  disabled={saving}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une question
                </button>
              </div>

              {/* Message si aucune question */}
              {questions.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-rose text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune question dans ce formulaire
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Ajoutez des questions pour rendre votre formulaire fonctionnel
                  </p>
                  <button
                    onClick={handleAddQuestion}
                    className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto"
                    disabled={saving}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter votre première question
                  </button>
                </div>
              )}

          <div className="space-y-4">
            {questions.map((question, index) => (
              <AdvancedQuestionInput
                key={index}
                question={question}
                index={index}
                onChange={handleQuestionChange}
                onRemove={handleRemoveQuestion}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/">
            <button className="btn-secondary" disabled={saving}>
              Annuler
            </button>
          </Link>
          <button
            onClick={handleUpdateForm}
            className="btn-primary flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Mise à jour...
              </>
            ) : (
              'Mettre à jour le formulaire'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
