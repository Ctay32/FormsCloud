'use client'

import { useEffect, useState, createContext } from 'react'
import OrganizationSelector from './OrganizationSelector'
import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '../lib/auth'

const ADMIN_PATHS = ['/', '/create', '/edit', '/results', '/form', '/diagnostic', '/super-admin']

const shouldShowAdminShell = (pathname) => {
  if (!pathname) {
    return false
  }

  return ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}



// Contexte pour l'organisation courante
export const OrganizationContext = createContext({ organizationId: null })

export default function AdminShell({ children }) {
  const pathname = usePathname()
  const [userLabel, setUserLabel] = useState('Utilisateur')
  const [organizations, setOrganizations] = useState([])
  const [currentOrgId, setCurrentOrgId] = useState(null)
  const [loadingOrg, setLoadingOrg] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    const loadUserAndOrgs = async () => {
      setLoadingOrg(true)
      const currentUser = await auth.getCurrentUser()
      if (!currentUser) {
        setUserLabel('Utilisateur')
        setOrganizations([{ id: 'default', name: 'Personnel' }])
        setCurrentOrgId('default')
        setLoadingOrg(false)
        return
      }
      setUserLabel(
        currentUser.user_metadata?.full_name ||
        currentUser.email?.split('@')[0] ||
        'Utilisateur'
      )
      try {
        const isSuper = await import('../lib/superAdminApi').then(m => m.superAdminApi.isSuperAdmin())
        setIsSuperAdmin(isSuper)
      } catch (e) {
        setIsSuperAdmin(false)
      }
      try {
        const { data, error } = await import('../lib/supabase').then(m => m.supabase)
          .from('memberships')
          .select('organization_id, organizations(name)')
          .eq('user_id', currentUser.id)
        if (error || !data || data.length === 0) {
          setOrganizations([{ id: 'default', name: 'Personnel' }])
          setCurrentOrgId('default')
        } else {
          const orgs = [
            { id: 'default', name: 'Personnel' },
            ...data.map(m => ({ id: m.organization_id, name: m.organizations?.name || 'Équipe' }))
          ]
          setOrganizations(orgs)
          setCurrentOrgId(orgs[0]?.id)
        }
      } catch {
        setOrganizations([{ id: 'default', name: 'Personnel' }])
        setCurrentOrgId('default')
      }
      setLoadingOrg(false)
    }
    loadUserAndOrgs()
  }, [pathname])

  if (!shouldShowAdminShell(pathname)) {
    return children
  }

  return (
    <OrganizationContext.Provider value={{ organizationId: currentOrgId }}>
      <div className="min-h-screen bg-gray-50 lg:pl-[320px]">
        <aside className="hidden lg:flex fixed inset-y-4 left-4 w-[272px] rounded-[28px] border border-gray-200 bg-white shadow-sm z-40 overflow-hidden">
          <div className="flex h-full flex-col">
            {/* Workspace Switcher tout en haut */}
            <div className="border-b border-gray-200 px-5 py-4 bg-gray-50">
              <div className="mb-2 text-xs font-semibold text-gray-500 tracking-wide uppercase">Espace de travail</div>
              {loadingOrg ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-full mb-2" />
              ) : (
                <OrganizationSelector
                  organizations={organizations}
                  currentOrgId={currentOrgId}
                  onChange={id => {
                    setLoadingOrg(true)
                    setCurrentOrgId(id)
                    setTimeout(() => setLoadingOrg(false), 600) // Simule un chargement
                  }}
                />
              )}
            </div>
            {/* Bloc info utilisateur et navigation */}
            <div className="border-b border-gray-200 px-5 py-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose text-white text-lg font-bold shadow-sm">
                  F
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose/80 mb-1">
                    Administration
                  </div>
                  <div className="text-xl font-bold text-gray-900 leading-tight">
                    FormCloud
                  </div>
                  <div className="text-sm text-gray-500 mt-1 truncate max-w-[180px]">
                    {userLabel}
                  </div>
                </div>
              </div>
            </div>
            {/* ...existing code... */}
          </div>
        </aside>
        {/* ...existing code... */}
      </div>
    </OrganizationContext.Provider>

          <nav className="flex-1 px-4 py-5 space-y-2">
            {!isSuperAdmin ? (
              <>
                <Link
                  href="/"
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${pathname === '/' ? 'bg-rose text-white shadow-sm' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7v5H4V6zm9 0h7v13h-7V6zM4 13h7v6H4v-6z" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${pathname === '/create' ? 'bg-rose text-white shadow-sm' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau formulaire
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317a1 1 0 011.35-.936l1.514.658a1 1 0 00.89 0l1.514-.658a1 1 0 011.35.936l.193 1.648a1 1 0 00.572.793l1.487.682a1 1 0 01.27 1.622l-1.118 1.21a1 1 0 00-.246.853l.38 1.616a1 1 0 01-1.448 1.054l-1.452-.817a1 1 0 00-.977 0l-1.452.817a1 1 0 01-1.448-1.054l.38-1.616a1 1 0 00-.246-.853L2.83 9.162a1 1 0 01.27-1.622l1.487-.682a1 1 0 00.572-.793l.166-1.748z" />
                  </svg>
                  Paramètres
                </button>
              </>
            ) : (
              <Link
                href="/super-admin"
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors bg-purple-600 text-white shadow-sm`}
              >
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Console Centrale
              </Link>
            )}
          </nav>

          <div className="border-t border-gray-200 px-4 py-4">
            <button
              type="button"
              onClick={() => auth.signOut()}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose text-white text-base font-bold">
            F
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose mb-1">
              Administration
            </div>
            <div className="text-lg font-bold text-gray-900">{userLabel}</div>
          </div>
        </div>
        {isSuperAdmin && (
          <Link href="/super-admin" className="flex items-center gap-1 text-sm font-bold text-purple-600 bg-purple-50 px-3 py-2 rounded-xl">
            Console Centrale
          </Link>
        )}
      </div>

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  )
}