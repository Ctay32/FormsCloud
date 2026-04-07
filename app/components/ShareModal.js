'use client'

import { useState, useEffect } from 'react'
import { shareApi } from '../lib/share'

export default function ShareModal({ form, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('link')
  const [shareSettings, setShareSettings] = useState({
    isPublic: true,
    passwordProtected: false,
    password: '',
    maxResponses: null,
    expiresAt: null,
    thankYouMessage: 'Merci pour votre réponse !'
  })
  const [customUrl, setCustomUrl] = useState('')
  const [embedOptions, setEmbedOptions] = useState({
    width: '100%',
    height: '500px'
  })
  const [emails, setEmails] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [shareStats, setShareStats] = useState(null)
  const [embedCode, setEmbedCode] = useState(null)

  useEffect(() => {
    if (form) {
      setShareSettings({
        isPublic: form.is_public !== false,
        passwordProtected: form.password_protected || false,
        password: form.access_password || '',
        maxResponses: form.max_responses || null,
        expiresAt: form.expires_at || null,
        thankYouMessage: form.thank_you_message || 'Merci pour votre réponse !'
      })
      setCustomUrl(form.custom_url || '')
      loadShareStats()
    }
  }, [form])

  const loadShareStats = async () => {
    if (form) {
      try {
        const stats = await shareApi.getShareStats(form.id)
        setShareStats(stats)
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err)
      }
    }
  }

  const handleSaveSettings = async () => {
    if (!form) return
    
    try {
      setLoading(true)
      await shareApi.updateShareSettings(form.id, shareSettings)
      onClose()
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      alert('Erreur lors de la sauvegarde des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateEmbed = async () => {
    if (!form) return
    
    try {
      const code = await shareApi.generateEmbedCode(form.id, embedOptions)
      setEmbedCode(code)
    } catch (err) {
      console.error('Erreur lors de la génération du code:', err)
    }
  }

  const handleShareByEmail = async () => {
    if (!form || !emails.trim()) return
    
    try {
      setLoading(true)
      const emailList = emails.split(',').map(e => e.trim()).filter(e => e)
      const result = await shareApi.shareByEmail(form.id, emailList, emailMessage)
      alert(result.message)
      setEmails('')
      setEmailMessage('')
    } catch (err) {
      console.error('Erreur lors du partage par email:', err)
      alert('Erreur lors de l\'envoi des emails')
    } finally {
      setLoading(false)
    }
  }

  const handleShareOnSocial = async (platform) => {
    if (!form) return
    
    try {
      await shareApi.shareOnSocial(form.id, platform, {
        title: form.title,
        description: form.description
      })
    } catch (err) {
      console.error('Erreur lors du partage social:', err)
    }
  }

  const handleGenerateQR = async () => {
    if (!form) return
    
    try {
      const qrData = await shareApi.generateQRCode(form.id)
      // Ouvrir le QR code dans un nouvel onglet
      window.open(qrData.qrCodeUrl, '_blank')
    } catch (err) {
      console.error('Erreur lors de la génération du QR code:', err)
    }
  }

  const handleExportPDF = async () => {
    if (!form) return
    
    try {
      const pdfData = await shareApi.exportToPDF(form.id, form)
      // Simuler le téléchargement
      const link = document.createElement('a')
      link.href = pdfData.downloadUrl
      link.download = pdfData.filename
      link.click()
    } catch (err) {
      console.error('Erreur lors de l\'export PDF:', err)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Lien copié dans le presse-papiers !')
  }

  const formUrl = customUrl 
    ? `${window.location.origin}/${customUrl}`
    : `${window.location.origin}/form/${form?.id}`

  if (!isOpen || !form) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Partager "{form.title}"
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {['link', 'embed', 'email', 'social', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-rose text-rose'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'link' && 'Lien'}
                {tab === 'embed' && 'Intégrer'}
                {tab === 'email' && 'Email'}
                {tab === 'social' && 'Réseaux'}
                {tab === 'settings' && 'Paramètres'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tab Lien */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL personnalisée
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="mon-formulaire"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  />
                  <button
                    onClick={() => copyToClipboard(formUrl)}
                    className="btn-secondary"
                  >
                    Copier
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {window.location.origin}/[votre-url]
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien direct
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(formUrl)}
                    className="btn-secondary"
                  >
                    Copier
                  </button>
                  <button
                    onClick={handleGenerateQR}
                    className="btn-secondary"
                  >
                    QR Code
                  </button>
                </div>
              </div>

              {/* Statistiques de partage */}
              {shareStats && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Statistiques de partage</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-rose">
                        {shareStats.filter(s => s.event_type === 'view').length}
                      </div>
                      <div className="text-gray-600">Vues</div>
                    </div>
                    <div>
                      <div className="font-semibold text-rose">
                        {shareStats.filter(s => s.event_type === 'click').length}
                      </div>
                      <div className="text-gray-600">Clics</div>
                    </div>
                    <div>
                      <div className="font-semibold text-rose">
                        {shareStats.filter(s => s.event_type === 'share').length}
                      </div>
                      <div className="text-gray-600">Partages</div>
                    </div>
                    <div>
                      <div className="font-semibold text-rose">
                        {form.share_count || 0}
                      </div>
                      <div className="text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Intégrer */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Options d'intégration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Largeur
                    </label>
                    <input
                      type="text"
                      value={embedOptions.width}
                      onChange={(e) => setEmbedOptions({...embedOptions, width: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hauteur
                    </label>
                    <input
                      type="text"
                      value={embedOptions.height}
                      onChange={(e) => setEmbedOptions({...embedOptions, height: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateEmbed}
                  className="btn-primary mt-3"
                >
                  Générer le code
                </button>
              </div>

              {embedCode && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Code d'intégration</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HTML (iFrame)
                      </label>
                      <textarea
                        value={embedCode.iframe}
                        readOnly
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(embedCode.iframe)}
                        className="btn-secondary mt-2"
                      >
                        Copier le code
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Email */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresses email (séparées par des virgules)
                </label>
                <textarea
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message personnel (optionnel)
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="J'aimerais avoir votre opinion sur..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                />
              </div>

              <button
                onClick={handleShareByEmail}
                disabled={loading || !emails.trim()}
                className="btn-primary"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer les emails'}
              </button>
            </div>
          )}

          {/* Tab Réseaux sociaux */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Partager sur les réseaux sociaux</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleShareOnSocial('facebook')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white font-bold">f</span>
                  </div>
                  <span className="text-sm">Facebook</span>
                </button>

                <button
                  onClick={() => handleShareOnSocial('twitter')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white font-bold">𝕏</span>
                  </div>
                  <span className="text-sm">Twitter</span>
                </button>

                <button
                  onClick={() => handleShareOnSocial('linkedin')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white font-bold">in</span>
                  </div>
                  <span className="text-sm">LinkedIn</span>
                </button>

                <button
                  onClick={() => handleShareOnSocial('whatsapp')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white font-bold">W</span>
                  </div>
                  <span className="text-sm">WhatsApp</span>
                </button>
              </div>

              <button
                onClick={handleExportPDF}
                className="btn-secondary w-full"
              >
                Exporter en PDF
              </button>
            </div>
          )}

          {/* Tab Paramètres */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="font-medium text-gray-900">Paramètres de partage</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Formulaire public</label>
                    <p className="text-xs text-gray-500">Tout le monde peut répondre</p>
                  </div>
                  <button
                    onClick={() => setShareSettings({...shareSettings, isPublic: !shareSettings.isPublic})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      shareSettings.isPublic ? 'bg-rose' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      shareSettings.isPublic ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Protégé par mot de passe</label>
                    <p className="text-xs text-gray-500">Mot de passe requis</p>
                  </div>
                  <button
                    onClick={() => setShareSettings({...shareSettings, passwordProtected: !shareSettings.passwordProtected})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      shareSettings.passwordProtected ? 'bg-rose' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      shareSettings.passwordProtected ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {shareSettings.passwordProtected && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      value={shareSettings.password}
                      onChange={(e) => setShareSettings({...shareSettings, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre maximum de réponses
                  </label>
                  <input
                    type="number"
                    value={shareSettings.maxResponses || ''}
                    onChange={(e) => setShareSettings({...shareSettings, maxResponses: parseInt(e.target.value) || null})}
                    placeholder="Illimité"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message de remerciement
                  </label>
                  <textarea
                    value={shareSettings.thankYouMessage}
                    onChange={(e) => setShareSettings({...shareSettings, thankYouMessage: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
