import { supabase } from './supabase.js'
import { auth } from './auth.js'
import { usersApi } from './users.js'

export const superAdminApi = {
  // Vérifie si l'utilisateur est super admin
  async isSuperAdmin() {
    try {
      const user = await auth.getCurrentUser()
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('users')
        .select('is_super_admin')
        .eq('id', user.id)
        .maybeSingle()
        
      if (error) {
        console.error("Erreur check super admin:", error)
        return false
      }
      
      console.log("=== CHECK DB SUPER ADMIN ===", data)
      return data?.is_super_admin === true
    } catch (e) {
      console.error("Exception check super admin:", e)
      return false
    }
  },

  async requireSuperAdmin() {
    const isSuper = await this.isSuperAdmin()
    if (!isSuper) throw new Error("Accès refusé. Vous devez être super administrateur.")
  },

  // USERS
  async getAllUsers() {
    await this.requireSuperAdmin()
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, is_super_admin, company, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async deleteUser(userId) {
    await this.requireSuperAdmin()
    // Normalement via l'API Admin de Supabase, il faut une clé service_role. 
    // Sur le client, supprimer la ligne dans 'users' peut ne pas supprimer l'auth.users si les RLS ou triggers l'empêchent, 
    // mais si le backend est configuré pour écouter ou si on a CASCADE DELETE. 
    // En attendant, on supprime de la table publique users et des organisations.
    const { error } = await supabase.from('users').delete().eq('id', userId)
    if (error) throw error
  },

  // ORGANIZATIONS
  async getAllOrganizations() {
    await this.requireSuperAdmin()
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, created_at, memberships(count)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async deleteOrganization(orgId) {
    await this.requireSuperAdmin()
    const { error } = await supabase.from('organizations').delete().eq('id', orgId)
    if (error) throw error
  },

  // FORMS
  async getAllForms() {
    await this.requireSuperAdmin()
    const { data: forms, error } = await supabase
      .from('forms')
      .select('id, title, user_id, organization_id, created_at, users(email), organizations(name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    
    // Pour chaque form, récupérer le nb de réponses
    if (!forms || forms.length === 0) return []
    
    const formIds = forms.map(f => f.id)
    const { data: responses, error: respError } = await supabase
      .from('responses')
      .select('form_id')
      .in('form_id', formIds)
      
    if (respError) throw respError
    
    const countMap = (responses || []).reduce((acc, r) => {
      acc[r.form_id] = (acc[r.form_id] || 0) + 1
      return acc
    }, {})

    return forms.map(f => ({
      ...f,
      responsesCount: countMap[f.id] || 0,
      userName: f.users?.email || 'Inconnu',
      orgName: f.organizations?.name || 'Aucune'
    }))
  },

  async deleteForm(formId) {
    await this.requireSuperAdmin()
    const { error } = await supabase.from('forms').delete().eq('id', formId)
    if (error) throw error
  }
}
