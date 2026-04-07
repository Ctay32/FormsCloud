'use client'

import { useState, useEffect } from 'react'
import FormCard from './components/FormCard'
import Link from 'next/link'
import { formsApi, responsesApi } from './lib/api'
import UserProfile from './components/UserProfile'
import ShareModal from './components/ShareModal'

export default function Dashboard() {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shareModal, setShareModal] = useState({ isOpen: false, form: null })

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    try {
      setLoading(true)
      const data = await formsApi.getAll()
      setForms(data)
    } catch (err) {
      console.error('Erreur lors du chargement des formulaires:', err)
      setError('Impossible de charger les formulaires')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (formId) => {
    window.open(`/form/${formId}`, '_blank')
  }

  const handleAnswers = (formId) => {
    window.location.href = `/results/${formId}`
  }

  const handleEdit = (formId) => {
    window.location.href = `/edit/${formId}`
  }

  const handleDelete = async (formId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) {
      try {
        await formsApi.delete(formId)
        loadForms() // Recharger la liste
      } catch (err) {
        console.error('Erreur lors de la suppression:', err)
        setError('Impossible de supprimer le formulaire')
      }
    }
  }

  const handleShare = (form) => {
    setShareModal({ isOpen: true, form })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des formulaires...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
            <button
              onClick={loadForms}
              className="btn-primary"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mes formulaires
            </h1>
            <p className="text-gray-600">
              Gérez tous vos formulaires et consultez les réponses
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="btn-secondary text-sm px-4 py-2">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Accueil
            </Link>
            <UserProfile />
          </div>
        </div>

        {/* Add new form button */}
        <div className="mb-8">
          <Link href="/create">
            <button className="btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau formulaire
            </button>
          </Link>
        </div>

        {/* Forms grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {form.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {form.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{form.date}</span>
                  <span className="font-medium text-rose">
                    {form.responses} réponse{form.responses > 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleView(form.id)}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Voir
                  </button>
                  
                  <button
                    onClick={() => handleShare(form)}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684m0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684" />
                    </svg>
                    Partager
                  </button>
                  
                  <button
                    onClick={() => handleEdit(form.id)}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                  
                  <button
                    onClick={() => handleAnswers(form.id)}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Réponses
                  </button>
                  
                  <button
                    onClick={() => handleDelete(form.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-3 py-1 rounded-lg transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {forms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun formulaire
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre premier formulaire
            </p>
            <Link href="/create">
              <button className="btn-primary">
                Créer un formulaire
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        form={shareModal.form}
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, form: null })}
      />
    </div>
  )
}
