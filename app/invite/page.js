import { useState, useContext } from 'react'
import { supabase } from '../lib/supabase.js'
import { auth } from '../lib/auth.js'
import { OrganizationContext } from '../components/AdminShell'


  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const { organizationId } = useContext(OrganizationContext)

  const handleInvite = async (e) => {
    e.preventDefault()
    setStatus('Envoi en cours...')
    try {
      const currentUser = await auth.getCurrentUser()
      if (!currentUser) throw new Error('Utilisateur non connecté')
      // Chercher l'utilisateur invité
      const { data: invitedUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (userError) throw userError
      if (!invitedUser) {
        setStatus("Utilisateur non trouvé. Il doit d'abord s'inscrire.")
        return
      }
      // Insérer dans memberships (role viewer par défaut)
      const orgId = organizationId && organizationId !== 'default' ? organizationId : null
      if (!orgId) {
        setStatus("Aucune organisation sélectionnée.")
        return
      }
      const { error: insertError } = await supabase
        .from('memberships')
        .insert({ user_id: invitedUser.id, organization_id: orgId, role: 'viewer' })
      if (insertError) throw insertError
      setStatus('Invitation envoyée !')
    } catch (err) {
      setStatus('Erreur : ' + (err.message || err))
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Inviter un membre</h1>
      <form onSubmit={handleInvite}>
        <label className="block mb-2 text-sm font-medium">Email du membre</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2 mb-4"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="bg-rose text-white px-4 py-2 rounded font-semibold">Inviter</button>
      </form>
      {status && <div className="mt-4 text-sm text-gray-600">{status}</div>}
    </div>
  )
}
