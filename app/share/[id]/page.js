'use client'

import { useState, useEffect } from 'react'
import { formsApi } from '../../lib/api'
import { shareApi } from '../../lib/share'
import { supabase } from '../../lib/supabase'
import { useParams } from 'next/navigation'

export default function SharePage() {
  const params = useParams()
  const shareId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shareSettings, setShareSettings] = useState(null)

  useEffect(() => {
    if (!shareId) {
      return
    }

    loadFormByCustomUrl()
    trackShareView()
  }, [shareId])

  const loadFormByCustomUrl = async () => {
    try {
      setLoading(true)
      // Essayer de charger par URL personnalisée d'abord
      const { data: formByCustomUrl } = await supabase
        .from('forms')
        .select('*')
        .eq('custom_url', shareId)
        .single()

      if (formByCustomUrl) {
        setForm(formByCustomUrl)
        setShareSettings(formByCustomUrl.share_settings || {})
        return
      }

      // Si pas trouvé par URL personnalisée, essayer par ID
      const formById = await formsApi.getById(shareId)
      if (formById) {
        setForm(formById)
        setShareSettings(formById.share_settings || {})
      } else {
        setError('Formulaire non trouvé')
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError('Formulaire non trouvé ou inaccessible')
    } finally {
      setLoading(false)
    }
  }

  const trackShareView = async () => {
    try {
      // Générer un ID de session unique
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Suivre la vue
      await shareApi.trackFormAccess(shareId, sessionId)
      
      // Stocker le session ID pour suivre la soumission
      sessionStorage.setItem('form_session_id', sessionId)
    } catch (err) {
      console.error('Erreur lors du tracking:', err)
    }
  }

  const handleSocialShare = async (platform) => {
    if (!form) return
    
    try {
      await shareApi.shareOnSocial(shareId, platform, {
        title: form.title,
        description: form.description
      })
    } catch (err) {
      console.error('Erreur lors du partage:', err)
    }
  }

  const copyShareLink = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl)
    alert('Lien copié dans le presse-papiers !')
  }

  const generateQRCode = async () => {
    if (!form) return
    
    try {
      const qrData = await shareApi.generateQRCode(shareId)
      window.open(qrData.qrCodeUrl, '_blank')
    } catch (err) {
      console.error('Erreur lors de la génération du QR code:', err)
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

  if (error) {
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
              Le formulaire que vous cherchez n'existe pas ou n'est pas accessible
            </p>
            <a href="/" className="btn-primary">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!form) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {form.title}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {form.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Répondre au formulaire
                    </h2>
                    {shareSettings?.showProgressBar && (
                      <div className="text-sm text-gray-500">
                        Étape 1 sur {form.questions?.length || 1}
                      </div>
                    )}
                  </div>
                  
                  {/* Message d'accueil si protégé */}
                  {shareSettings?.passwordProtected && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-yellow-700">
                          Ce formulaire est protégé par mot de passe
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Limites de réponses */}
                  {shareSettings?.maxResponses && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-blue-700">
                          Limité à {shareSettings.maxResponses} réponses
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Date d'expiration */}
                  {shareSettings?.expiresAt && new Date(shareSettings.expiresAt) < new Date() && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-700">
                          Ce formulaire a expiré le {new Date(shareSettings.expiresAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bouton pour répondre */}
                <div className="text-center">
                  <a 
                    href={`/form/${form.id}`}
                    className="btn-primary text-lg px-8 py-3 inline-block"
                  >
                    Commencer à répondre
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Panneau latéral de partage */}
          <div className="space-y-6">
            {/* Options de partage rapide */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Partager ce formulaire</h3>
              <div className="space-y-3">
                <button
                  onClick={copyShareLink}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copier le lien
                </button>

                <button
                  onClick={generateQRCode}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11l2-2m-2 2l-2-2m2 2l2-2m-2 2h-6m-6 0V4a2 2 0 012-2h6a2 2 0 012 2v1M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  QR Code
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSocialShare('facebook')}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <span className="font-bold">f</span>
                  </button>
                  <button
                    onClick={() => handleSocialShare('twitter')}
                    className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                  >
                    <span className="font-bold">𝕏</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques publiques */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">À propos</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500">Créé le</div>
                  <div className="font-medium">
                    {new Date(form.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Nombre de questions</div>
                  <div className="font-medium">
                    {form.questions?.length || 0}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Statut</div>
                  <div className="font-medium text-green-600">
                    {shareSettings?.isPublic !== false ? 'Public' : 'Privé'}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <a 
                  href={`/form/${form.id}`}
                  className="w-full btn-primary block text-center"
                >
                  Remplir le formulaire
                </a>
                <a 
                  href={`/results/${form.id}`}
                  className="w-full btn-secondary block text-center"
                >
                  Voir les résultats
                </a>
                <a 
                  href="/"
                  className="w-full btn-secondary block text-center"
                >
                  Créer mon propre formulaire
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
