import { supabase } from './supabase.js'
import { auth } from './auth.js'

const buildProfilePayload = (user, profile = {}) => ({
  id: user.id,
  email: user.email,
  full_name: profile.full_name || user.user_metadata?.full_name || null,
  avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || null,
  bio: profile.bio || null,
  company: profile.company || null,
  phone_number: profile.phone_number || null,
  preferences: profile.preferences || {
    notifications: true,
    language: 'fr',
    theme: 'light'
  },
  updated_at: new Date().toISOString()
})

// User profile operations
export const usersApi = {
  async ensureProfile() {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (existingProfile) {
      return existingProfile
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(buildProfilePayload(user), { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Récupérer le profil de l'utilisateur connecté
  async getCurrentProfile() {
    return this.ensureProfile()
  },

  // Mettre à jour le profil utilisateur
  async updateProfile(updates) {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    await this.ensureProfile()

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Mettre à jour l'avatar utilisateur
  async updateAvatar(file) {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    await this.ensureProfile()

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload le fichier
    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath)

    // Mettre à jour le profil
    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Mettre à jour les préférences utilisateur
  async updatePreferences(preferences) {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    const currentUser = await this.ensureProfile()

    const mergedPreferences = {
      ...currentUser?.preferences,
      ...preferences
    }

    const { data, error } = await supabase
      .from('users')
      .update({ preferences: mergedPreferences })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Obtenir un utilisateur publique par ID (pour le partage de formulaires)
  async getPublicProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, company')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Supprimer le compte utilisateur (DELETE CASCADE via trigger)
  async deleteAccount() {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    // Supprimer le compte Supabase (qui cascade supprime la ligne dans users)
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) throw error
    
    // Se déconnecter
    await auth.signOut()
  }
}
