'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../lib/auth'
import { superAdminApi } from '../lib/superAdminApi'

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [activeTab, setActiveTab] = useState('users') // 'users', 'organizations', 'forms'
  
  const [users, setUsers] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [forms, setForms] = useState([])

  useEffect(() => {
    let isMounted = true
    const checkAccessAndLoad = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser) {
          router.push('/auth')
          return
        }
        
        const isSuper = await superAdminApi.isSuperAdmin()
        if (!isSuper) {
          router.push('/')
          return
        }

        // Charger tout le contenu
        const [usersData, orgsData, formsData] = await Promise.all([
          superAdminApi.getAllUsers(),
          superAdminApi.getAllOrganizations(),
          superAdminApi.getAllForms()
        ])

        if (isMounted) {
          setUsers(usersData)
          setOrganizations(orgsData)
          setForms(formsData)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Impossible d\'accéder au super admin')
          setLoading(false)
        }
      }
    }

    checkAccessAndLoad()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur définitivement ?")) return
    try {
      await superAdminApi.deleteUser(userId)
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      alert("Erreur: " + err.message)
    }
  }

  const handleDeleteOrg = async (orgId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette organisation (et tous ses formulaires associés) ?")) return
    try {
      await superAdminApi.deleteOrganization(orgId)
      setOrganizations(organizations.filter(o => o.id !== orgId))
      setForms(forms.filter(f => f.organization_id !== orgId)) // Cleanup local UI
    } catch (err) {
      alert("Erreur: " + err.message)
    }
  }

  const handleDeleteForm = async (formId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce formulaire ?")) return
    try {
      await superAdminApi.deleteForm(formId)
      setForms(forms.filter(f => f.id !== formId))
    } catch (err) {
      alert("Erreur: " + err.message)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1280px] p-6 text-center">
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6 text-red-700 font-medium">
          {error}
          <div className="mt-4">
            <button onClick={() => router.push('/')} className="btn-secondary">Retour à l'accueil</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] pb-12">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[28px] border border-gray-200 bg-white/50 backdrop-blur-xl px-8 py-7 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-4 w-4 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-rose bg-clip-text text-transparent">
              Super Admin Console
            </h1>
          </div>
          <p className="text-gray-600">Gérez toutes les instances, organisations et utilisateurs du SaaS.</p>
        </div>
      </div>

      {/* METRICS */}
      <div className="mb-8 grid gap-5 sm:grid-cols-3">
        <div className="card overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50 z-0"></div>
          <div className="relative z-10">
            <div className="text-sm font-medium uppercase tracking-wider text-blue-600 mb-2">Utilisateurs Totaux</div>
            <div className="text-4xl font-extrabold text-slate-900 group-hover:scale-105 transition-transform origin-left">{users.length}</div>
          </div>
        </div>
        <div className="card overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-50 z-0"></div>
          <div className="relative z-10">
            <div className="text-sm font-medium uppercase tracking-wider text-emerald-600 mb-2">Organisations Actives</div>
            <div className="text-4xl font-extrabold text-slate-900 group-hover:scale-105 transition-transform origin-left">{organizations.length}</div>
          </div>
        </div>
        <div className="card overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-50 z-0"></div>
          <div className="relative z-10">
            <div className="text-sm font-medium uppercase tracking-wider text-amber-600 mb-2">Formulaires Publiés</div>
            <div className="text-4xl font-extrabold text-slate-900 group-hover:scale-105 transition-transform origin-left">{forms.length}</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Utilisateurs
        </button>
        <button 
          onClick={() => setActiveTab('organizations')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'organizations' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Organisations
        </button>
        <button 
          onClick={() => setActiveTab('forms')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'forms' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Formulaires
        </button>
      </div>

      {/* CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Utilisateur</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Entreprise</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Date d'inscription</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{user.full_name || 'Sans Nom'}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.company || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">Aucun utilisateur trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT: ORGANIZATIONS */}
      {activeTab === 'organizations' && (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Nom de l'Organisation</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Membres</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Créée le</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {organizations.map(org => (
                  <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase">
                          {org.name.substring(0, 2)}
                        </div>
                        {org.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center justify-center bg-gray-100 rounded-full px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                        {org.memberships[0]?.count || 0} membres
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(org.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteOrg(org.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
                {organizations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">Aucune organisation trouvée.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT: FORMS */}
      {activeTab === 'forms' && (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Titre</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Propriétaire</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Organisation</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500">Réponses</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {forms.map(form => (
                  <tr key={form.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 mb-1">{form.title}</div>
                      <div className="text-xs text-gray-500 font-mono" title="ID">{form.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {form.userName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {form.orgName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${form.responsesCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {form.responsesCount} réf
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => window.open(`/form/${form.id}`, '_blank')} className="text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                          Voir
                        </button>
                        <button onClick={() => handleDeleteForm(form.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {forms.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Aucun formulaire trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
