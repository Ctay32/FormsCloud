'use client'

import { useState } from 'react'
import AdvancedQuestionInput from '../components/AdvancedQuestionInput'
import Link from 'next/link'
import { formsApi, responsesApi } from '../lib/api'
import { useRouter } from 'next/navigation'

export default function CreateForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([
    { text: '', type: 'text', required: false }
  ])
  const [settings, setSettings] = useState({
    collectEmail: false,
    allowMultipleSubmissions: true,
    showProgressBar: true,
    shuffleQuestions: false,
    limitTime: false,
    timeLimit: 30
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('questions')
  const router = useRouter()

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index][field] = value
    setQuestions(updatedQuestions)
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', type: 'text', required: false }])
  }

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const handleCreateForm = async () => {
    // Validation du titre
    if (!title.trim()) {
      setError('Veuillez entrer un titre pour le formulaire')
      return
    }

    // Validation des questions
    const validQuestions = questions.filter(q => q.text.trim())
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
      setLoading(true)
      setError(null)
      
      console.log('Tentative de création du formulaire:', {
        title: title.trim(),
        description: description.trim(),
        questionsCount: validQuestions.length,
        settings: settings
      })
      
      const formData = {
        title: title.trim(),
        description: description.trim(),
        questions: validQuestions,
        settings: settings
      }

      console.log('Données du formulaire à créer:', formData)
      
      const result = await formsApi.create(formData)
      console.log('Formulaire créé avec succès:', result)
      
      // Rediriger vers le dashboard
      router.push('/')
    } catch (err) {
      console.error('Erreur détaillée lors de la création du formulaire:', err)
      console.error('Stack trace:', err.stack)
      
      // Message d'erreur plus spécifique
      let errorMessage = 'Impossible de créer le formulaire. Veuillez réessayer.'
      
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
      setLoading(false)
    }
  }

  const addQuestionTemplate = (template) => {
    const newQuestions = {
      'satisfaction': [
        { text: 'Comment évaluez-vous notre service ?', type: 'linear_scale', required: true, scaleSteps: 5, scaleStart: 'Très insatisfait', scaleEnd: 'Très satisfait' },
        { text: 'Quelle est la probabilité que vous nous recommandiez ?', type: 'linear_scale', required: true, scaleSteps: 10, scaleStart: '0 - Pas du tout', scaleEnd: '10 - Absolument' },
        { text: 'Avez-vous des suggestions pour nous améliorer ?', type: 'long_answer', required: false, helpText: 'Soyez aussi précis que possible' }
      ],
      'contact': [
        { text: 'Nom complet', type: 'short_answer', required: true, placeholder: 'Entrez votre nom complet' },
        { text: 'Email', type: 'email', required: true, placeholder: 'votre@email.com' },
        { text: 'Téléphone', type: 'phone', required: false, placeholder: '+33 1 23 45 67 89', phoneFormat: 'international' },
        { text: 'Sujet de votre demande', type: 'dropdown', required: true, options: ['Support technique', 'Question commerciale', 'Partenariat', 'Autre'] }
      ],
      'survey': [
        { text: 'Âge', type: 'number', required: true, min: 18, max: 120 },
        { text: 'Ville', type: 'short_answer', required: true, placeholder: 'Votre ville' },
        { text: "Centres d'intérêt", type: 'checkboxes', required: false, options: ['Sport', 'Musique', 'Cinéma', 'Lecture', 'Voyages', 'Technologie', 'Gaming', 'Cuisine'] },
        { text: 'Fréquence d\'utilisation de nos services', type: 'multiple_choice', required: true, options: ['Tous les jours', 'Plusieurs fois par semaine', 'Une fois par semaine', 'Quelques fois par mois', 'Rarement'] }
      ],
      'feedback': [
        { text: "Qu'avez-vous le plus aimé ?", type: 'multiple_choice', required: true, options: ['Le service client', 'La qualité du produit', 'La rapidité', 'Le prix', "L'interface utilisateur"] },
        { text: 'Notez votre expérience globale', type: 'linear_scale', required: true, scaleSteps: 5, scaleStart: 'Mauvais', scaleEnd: 'Excellent' },
        { text: 'Que pourrions-nous améliorer ?', type: 'long_answer', required: false, helpText: 'Vos retours nous aident à nous améliorer' },
        { text: 'Recommanderiez-vous nos services ?', type: 'grid', required: true, gridData: { rows: ['Amis', 'Famille', 'Collègues'], columns: ['Oui', 'Non', 'Peut-être'] } }
      ],
      'event': [
        { text: 'Nom complet', type: 'short_answer', required: true },
        { text: 'Email', type: 'email', required: true },
        { text: 'Téléphone', type: 'phone', required: true },
        { text: 'Date de naissance', type: 'date', required: true },
        { text: "Heure d'arrivée souhaitée", type: 'time', required: true },
        { text: 'Restrictions alimentaires', type: 'checkboxes', required: false, options: ['Végétarien', 'Vegan', 'Sans gluten', 'Allergies aux noix', 'Halal', 'Casher', 'Autre'] },
        { text: "Comment avez-vous entendu parler de cet événement ?", type: 'dropdown', required: true, options: ['Réseaux sociaux', 'Amis/Famille', 'Email', 'Site web', 'Publicité', 'Autre'] }
      ]
    }

    setQuestions([...questions, ...newQuestions[template]])
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
            Créer un formulaire avancé
          </h1>
          <p className="text-gray-600">
            Concevez des formulaires professionnels avec des options avancées
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
        <div className="card mb-6">
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['questions', 'settings', 'templates'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-rose text-rose'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'questions' && 'Questions'}
                  {tab === 'settings' && 'Paramètres'}
                  {tab === 'templates' && 'Modèles'}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'questions' && (
          <div>
            {/* Quick templates */}
            <div className="mb-6 p-4 bg-rose-light rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Modèles rapides</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => addQuestionTemplate('satisfaction')}
                  className="btn-secondary text-xs p-2"
                >
                  Satisfaction
                </button>
                <button
                  onClick={() => addQuestionTemplate('contact')}
                  className="btn-secondary text-xs p-2"
                >
                  Contact
                </button>
                <button
                  onClick={() => addQuestionTemplate('survey')}
                  className="btn-secondary text-xs p-2"
                >
                  Sondage
                </button>
                <button
                  onClick={() => addQuestionTemplate('feedback')}
                  className="btn-secondary text-xs p-2"
                >
                  Feedback
                </button>
              </div>
            </div>

            {/* Questions */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Questions ({questions.length})
                </h2>
                <button
                  onClick={handleAddQuestion}
                  className="btn-primary px-6 py-3 flex items-center gap-2 text-base font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une question
                </button>
              </div>

              {/* Bouton flottant si aucune question */}
              {questions.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-rose text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Commencez par ajouter une question
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Créez votre première question pour commencer votre formulaire
                  </p>
                  <button
                    onClick={handleAddQuestion}
                    className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto"
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
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres du formulaire</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Collecter les emails</label>
                  <p className="text-xs text-gray-500">Demander l'email des répondants</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, collectEmail: !settings.collectEmail})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.collectEmail ? 'bg-rose' : 'bg-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.collectEmail ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Réponses multiples</label>
                  <p className="text-xs text-gray-500">Autoriser plusieurs soumissions</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, allowMultipleSubmissions: !settings.allowMultipleSubmissions})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.allowMultipleSubmissions ? 'bg-rose' : 'bg-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.allowMultipleSubmissions ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Barre de progression</label>
                  <p className="text-xs text-gray-500">Afficher l'avancement</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, showProgressBar: !settings.showProgressBar})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showProgressBar ? 'bg-rose' : 'bg-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showProgressBar ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Mélanger les questions</label>
                  <p className="text-xs text-gray-500">Ordre aléatoire</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, shuffleQuestions: !settings.shuffleQuestions})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.shuffleQuestions ? 'bg-rose' : 'bg-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.shuffleQuestions ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Limite de temps</label>
                  <p className="text-xs text-gray-500">Restreindre le temps de réponse</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, limitTime: !settings.limitTime})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.limitTime ? 'bg-rose' : 'bg-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.limitTime ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {settings.limitTime && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Temps limite (minutes)</label>
                  <input
                    type="number"
                    value={settings.timeLimit}
                    onChange={(e) => setSettings({...settings, timeLimit: parseInt(e.target.value) || 30})}
                    min="1"
                    max="180"
                    className="mt-1 w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-rose text-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfaction Client</h3>
              <p className="text-gray-600 text-sm mb-4">Évaluez la satisfaction de vos clients avec des questions sur le service et la qualité.</p>
              <button
                onClick={() => {
                  addQuestionTemplate('satisfaction')
                  setActiveTab('questions')
                }}
                className="btn-primary w-full"
              >
                Utiliser ce modèle
              </button>
            </div>

            <div className="card p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sondage Employés</h3>
              <p className="text-gray-600 text-sm mb-4">Recueillez les opinions de votre équipe sur l'environnement de travail.</p>
              <button
                onClick={() => {
                  addQuestionTemplate('survey')
                  setActiveTab('questions')
                }}
                className="btn-primary w-full"
              >
                Utiliser ce modèle
              </button>
            </div>

            <div className="card p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Formulaire Contact</h3>
              <p className="text-gray-600 text-sm mb-4">Créez un formulaire de contact professionnel avec validation.</p>
              <button
                onClick={() => {
                  addQuestionTemplate('contact')
                  setActiveTab('questions')
                }}
                className="btn-primary w-full"
              >
                Utiliser ce modèle
              </button>
            </div>

            <div className="card p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10m-7 4h10M3 21v-4a2 2 0 00-2-2H3m18 0v4a2 2 0 00-2 2H3m0 0h18" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback Produit</h3>
              <p className="text-gray-600 text-sm mb-4">Recueillez des retours détaillés sur vos produits et services.</p>
              <button
                onClick={() => {
                  addQuestionTemplate('feedback')
                  setActiveTab('questions')
                }}
                className="btn-primary w-full"
              >
                Utiliser ce modèle
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Link href="/">
            <button className="btn-secondary" disabled={loading}>
              Annuler
            </button>
          </Link>
          <button
            onClick={handleCreateForm}
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Création...
              </>
            ) : (
              'Créer le formulaire avancé'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
