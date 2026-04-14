'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ShareModal from './components/ShareModal'
import { auth } from './lib/auth'
import { formsApi } from './lib/api'
import { superAdminApi } from './lib/superAdminApi'

export default function Page() {
  const router = useRouter()
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [shareModal, setShareModal] = useState({ isOpen: false, form: null })

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const user = await auth.getCurrentUser()
        if (!user) {
          router.push('/auth')
          return
        }

        const isSuper = await superAdminApi.isSuperAdmin()
        if (isSuper) {
          router.replace('/super-admin')
          return
        }

        const data = await formsApi.getAll()
        if (isMounted) {
          setForms(data)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Impossible de charger les formulaires')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleView = (formId) => {
    router.push(`/form/${formId}`)
  }

  const handleEdit = (formId) => {
    router.push(`/edit/${formId}`)
  }

  const handleAnswers = (formId) => {
    router.push(`/results/${formId}`)
  }

  const handleShare = (form) => {
    setShareModal({ isOpen: true, form })
  }

  const handleDelete = async (formId) => {
    const confirmed = window.confirm('Supprimer ce formulaire ?')
    if (!confirmed) {
      return
    }

    try {
      await formsApi.delete(formId)
      setForms((currentForms) => currentForms.filter((form) => form.id !== formId))
    } catch (err) {
      setError(err.message || 'Impossible de supprimer le formulaire')
    }
  }

  const filteredForms = forms.filter((form) => {
    const haystack = `${form.title || ''} ${form.description || ''}`.toLowerCase()
    return haystack.includes(searchTerm.toLowerCase())
  })

  const displayedForms = [...filteredForms].sort((left, right) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(left.created_at) - new Date(right.created_at)
      case 'title-asc':
        return (left.title || '').localeCompare(right.title || '', 'fr')
      case 'title-desc':
        return (right.title || '').localeCompare(left.title || '', 'fr')
      case 'responses-desc':
        return (right.responses || 0) - (left.responses || 0)
      case 'responses-asc':
        return (left.responses || 0) - (right.responses || 0)
      case 'date-desc':
      default:
        return new Date(right.created_at) - new Date(left.created_at)
    }
  })

  const totalResponses = forms.reduce((sum, form) => sum + (form.responses || 0), 0)
  const draftForms = forms.filter((form) => (form.responses || 0) === 0).length
  const totalQuestions = forms.reduce((sum, form) => sum + (form.questionsCount || 0), 0)

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px]">
        <div className="card py-10 text-center text-gray-500">Chargement du tableau de bord...</div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 flex items-start justify-between gap-6 rounded-[28px] border border-gray-200 bg-white px-8 py-7 shadow-sm">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Mes formulaires</h1>
            <p className="text-gray-600">Gérez et suivez vos formulaires</p>
          </div>
          <div className="hidden items-center gap-3 text-gray-500 sm:flex">
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:bg-gray-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700">
              {forms.length}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-5 xl:grid-cols-4">
          <MetricCard label="Formulaires" value={forms.length} description="Total réel des formulaires créés" icon="document" />
          <MetricCard label="Réponses totales" value={totalResponses} description="Somme réelle des lignes de réponses" icon="inbox" />
          <MetricCard label="Sans réponse" value={draftForms} description="Formulaires sans réponse reçue" icon="info" />
          <MetricCard label="Questions totales" value={totalQuestions} description="Nombre réel de questions publiées" icon="chat" />
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-xl">
            <div className="relative">
              <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher un formulaire..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 focus:border-rose/40 focus:outline-none focus:ring-2 focus:ring-rose/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:border-rose/40 focus:outline-none focus:ring-2 focus:ring-rose/40"
            >
              <option value="date-desc">Plus récents</option>
              <option value="date-asc">Plus anciens</option>
              <option value="title-asc">Titre A-Z</option>
              <option value="title-desc">Titre Z-A</option>
              <option value="responses-desc">Réponses décroissant</option>
              <option value="responses-asc">Réponses croissant</option>
            </select>
            <div className="whitespace-nowrap text-sm text-gray-500">
              {displayedForms.length} formulaire{displayedForms.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {displayedForms.length > 0 ? (
          <div className="space-y-5">
            {displayedForms.map((form) => (
              <div key={form.id} className="card">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">{form.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${form.responses > 0 ? 'bg-rose/10 text-rose' : 'bg-gray-100 text-gray-700'}`}>
                        {form.responses > 0 ? 'Actif' : 'Sans réponse'}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-500">Créé le {form.date}</p>
                    <p className="max-w-2xl text-sm text-gray-600">
                      {form.description || 'Aucune description pour ce formulaire.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button onClick={() => handleView(form.id)} className="btn-secondary px-4 py-2 text-sm">
                      Voir
                    </button>
                    <button onClick={() => handleEdit(form.id)} className="btn-secondary px-4 py-2 text-sm">
                      Modifier
                    </button>
                    <button onClick={() => handleAnswers(form.id)} className="btn-secondary px-4 py-2 text-sm">
                      Réponses
                    </button>
                    <button onClick={() => handleShare(form)} className="btn-primary px-4 py-2 text-sm">
                      Partager
                    </button>
                    <button onClick={() => handleDelete(form.id)} className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-100">
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatItem label="Questions" value={form.questionsCount || 0} />
                  <StatItem label="Réponses" value={form.responses || 0} />
                  <StatItem label="Création" value={form.date} />
                  <StatItem label="Visibilité" value="Privé" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">Aucun formulaire</h3>
            <p className="mb-4 text-gray-600">Commencez par créer votre premier formulaire</p>
            <Link href="/create">
              <button className="btn-primary">Créer un formulaire</button>
            </Link>
          </div>
        )}
      </div>

      <ShareModal
        isOpen={shareModal.isOpen}
        form={shareModal.form}
        onClose={() => setShareModal({ isOpen: false, form: null })}
      />
    </>
  )
}

function MetricCard({ label, value, description, icon }) {
  return (
    <div className="card flex min-h-[168px] flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 text-sm text-gray-500">{label}</div>
          <div className="text-4xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
          <MetricIcon type={icon} />
        </div>
      </div>
      <div className="text-sm text-gray-500">{description}</div>
    </div>
  )
}

function StatItem({ label, value }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  )
}

function MetricIcon({ type }) {
  if (type === 'inbox') {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2m10 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0H7" />
      </svg>
    )
  }

  if (type === 'info') {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  if (type === 'chat') {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )
  }

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}