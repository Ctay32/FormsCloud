import { supabase } from './supabase.js'

// API pour le système de partage
export const shareApi = {
  // Créer un nouveau partage pour un formulaire
  async createShare(formId, shareType, shareData = {}) {
    const { data, error } = await supabase
      .from('form_shares')
      .insert([{
        form_id: formId,
        share_type: shareType,
        share_url: shareData.shareUrl || `${window.location.origin}/form/${formId}`,
        share_data: shareData,
        expires_at: shareData.expiresAt || null
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Récupérer tous les partages d'un formulaire
  async getFormShares(formId) {
    const { data, error } = await supabase
      .from('form_shares')
      .select('*')
      .eq('form_id', formId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Mettre à jour les paramètres de partage d'un formulaire
  async updateShareSettings(formId, settings) {
    const { data, error } = await supabase
      .from('forms')
      .update({
        share_settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', formId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Générer une URL personnalisée
  async generateCustomUrl(formId, customUrl) {
    // Vérifier si l'URL est déjà prise
    const { data: existing } = await supabase
      .from('forms')
      .select('id')
      .eq('custom_url', customUrl)
      .single()
    
    if (existing) {
      throw new Error('Cette URL personnalisée est déjà utilisée')
    }

    const { data, error } = await supabase
      .from('forms')
      .update({ custom_url: customUrl })
      .eq('id', formId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Suivre un événement de partage
  async trackShareEvent(formId, shareId, eventType, eventData = {}) {
    const { data, error } = await supabase
      .from('share_analytics')
      .insert([{
        form_id: formId,
        share_id: shareId,
        event_type: eventType,
        source: eventData.source || 'direct',
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        ip_address: eventData.ipAddress || null
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Suivre l'accès à un formulaire
  async trackFormAccess(formId, sessionId) {
    const { data, error } = await supabase
      .rpc('track_form_access', {
        p_form_id: formId,
        p_session_id: sessionId
      })
    
    if (error) throw error
    return data
  },

  // Récupérer les statistiques de partage
  async getShareStats(formId) {
    const { data, error } = await supabase
      .from('share_analytics')
      .select(`
        event_type,
        source,
        created_at,
        share_id,
        form_shares(share_type)
      `)
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Récupérer les statistiques d'accès
  async getAccessStats(formId) {
    const { data, error } = await supabase
      .from('form_access')
      .select('*')
      .eq('form_id', formId)
      .order('first_view_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Générer le code d'intégration (embed)
  async generateEmbedCode(formId, options = {}) {
    const baseUrl = window.location.origin
    const formUrl = `${baseUrl}/form/${formId}`
    
    const defaultOptions = {
      width: '100%',
      height: '500px',
      frameborder: '0',
      marginheight: '0',
      marginwidth: '0'
    }
    
    const embedOptions = { ...defaultOptions, ...options }
    
    const iframeCode = `<iframe 
  src="${formUrl}?embed=true" 
  width="${embedOptions.width}" 
  height="${embedOptions.height}" 
  frameborder="${embedOptions.frameborder}" 
  marginheight="${embedOptions.marginheight}" 
  marginwidth="${embedOptions.marginwidth}">
</iframe>`

    const scriptCode = `<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = "${formUrl}?embed=true";
    iframe.width = "${embedOptions.width}";
    iframe.height = "${embedOptions.height}";
    iframe.frameBorder = "${embedOptions.frameborder}";
    iframe.style.border = "none";
    
    var container = document.getElementById('formcloud-form-${formId}');
    if (container) {
      container.appendChild(iframe);
    }
  })();
</script>`

    return {
      iframe: iframeCode,
      script: scriptCode,
      div: `<div id="formcloud-form-${formId}"></div>`
    }
  },

  // Partager par email
  async shareByEmail(formId, emails, message) {
    const shareData = await shareApi.createShare(formId, 'email', {
      recipients: emails,
      message: message
    })

    // Pour l'instant, retourner les données
    // Dans une vraie implémentation, il faudrait intégrer un service d'email
    return {
      shareId: shareData.id,
      emailsSent: emails.length,
      message: 'Emails envoyés avec succès (simulation)'
    }
  },

  // Partager sur les réseaux sociaux
  async shareOnSocial(formId, platform, formData) {
    const baseUrl = window.location.origin
    const formUrl = `${baseUrl}/form/${formId}`
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}&text=${encodeURIComponent(formData.title || 'Découvrez ce formulaire')}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${formData.title || 'Découvrez ce formulaire'} ${formUrl}`)}`
    }

    const shareUrl = shareUrls[platform]
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      
      // Suivre le partage
      await shareApi.createShare(formId, 'social', {
        platform: platform,
        url: shareUrl
      })
    }

    return shareUrl
  },

  // Générer un QR code
  async generateQRCode(formId) {
    const baseUrl = window.location.origin
    const formUrl = `${baseUrl}/form/${formId}`
    
    // Utiliser un service public de QR code (pour l'exemple)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formUrl)}`
    
    return {
      qrCodeUrl: qrCodeUrl,
      formUrl: formUrl,
      downloadUrl: qrCodeUrl
    }
  },

  // Exporter le formulaire en PDF
  async exportToPDF(formId, formData) {
    // Pour l'instant, simulation
    // Dans une vraie implémentation, il faudrait utiliser une librairie comme jsPDF
    return {
      downloadUrl: `/api/forms/${formId}/export/pdf`,
      filename: `${formData.title || 'formulaire'}.pdf`,
      message: 'PDF généré avec succès (simulation)'
    }
  },

  // Valider une URL personnalisée
  async validateCustomUrl(customUrl) {
    const { data, error } = await supabase
      .from('forms')
      .select('id')
      .eq('custom_url', customUrl)
      .single()
    
    return {
      available: !data && !error,
      message: data ? 'Cette URL est déjà utilisée' : 'URL disponible'
    }
  }
}
