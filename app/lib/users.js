import { supabase } from './supabase.js'
import { auth } from './auth.js'

// User profile operations
export const usersApi = {
  // Récupérer le profil de l'utilisateur connecté
  async getCurrentProfile() {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  // Mettre à jour le profil utilisateur
  async updateProfile(updates) {
    const user = await auth.getCurrentUser()
    if (!user) throw new Error('Utilisateur non connecté')

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

    const { data: currentUser } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single()

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
