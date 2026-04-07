'use client'

import { useState, useEffect } from 'react'
import { auth } from '../lib/auth'
import { usersApi } from '../lib/users'
import Link from 'next/link'

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    loadUser()
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile()
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await auth.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        await loadProfile()
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      const userProfile = await usersApi.getCurrentProfile()
      setProfile(userProfile)
      setEditData(userProfile)
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      setShowDropdown(false)
      // Le middleware redirigera automatiquement vers /auth
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      await usersApi.updateProfile({
        full_name: editData.full_name,
        bio: editData.bio,
        company: editData.company,
        phone_number: editData.phone_number
      })
      await loadProfile()
      setIsEditingProfile(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin"></div>
    )
  }

  if (!user) {
    return (
      <Link href="/auth" className="btn-primary text-sm px-4 py-2">
        Se connecter
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-rose text-white rounded-full flex items-center justify-center">
            {(profile?.full_name?.charAt(0) || user.email?.charAt(0)).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:block">
          {profile?.full_name || user.email?.split('@')[0] || 'Utilisateur'}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* En-tête profil */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {profile?.full_name || 'Non défini'}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {profile?.company && (
              <p className="text-xs text-gray-600 mt-1">{profile.company}</p>
            )}
          </div>

          {/* Informations profil */}
          {!isEditingProfile && profile && (
            <div className="px-4 py-2 border-b border-gray-200 text-xs text-gray-600">
              {profile?.bio && <p className="mb-1">{profile.bio}</p>}
              {profile?.phone_number && <p>Tél: {profile.phone_number}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Inscrit: {new Date(profile?.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}

          {/* Mode édition */}
          {isEditingProfile && profile && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-xs space-y-2">
              <input
                type="text"
                placeholder="Nom complet"
                value={editData.full_name || ''}
                onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
              />
              <input
                type="text"
                placeholder="Entreprise"
                value={editData.company || ''}
                onChange={(e) => setEditData({...editData, company: e.target.value})}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={editData.phone_number || ''}
                onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
              />
              <textarea
                placeholder="Bio"
                value={editData.bio || ''}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-2 py-1 bg-rose text-white rounded text-xs hover:bg-rose/90"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <button
            onClick={() => {
              if (!isEditingProfile) {
                setIsEditingProfile(true)
              }
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isEditingProfile ? '✓ En cours de modification' : 'Modifier le profil'}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}
