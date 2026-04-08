'use client'

import { useState, useEffect } from 'react'
import AnswerList from '../../components/AnswerList'
import FilterBox from '../../components/FilterBox'
import Link from 'next/link'
import { formsApi, responsesApi } from '../../lib/api'
import { useParams } from 'next/navigation'

export default function ResultsPage() {
  const params = useParams()
  const formId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState([])
  const [filteredAnswers, setFilteredAnswers] = useState([])
  const [analysis, setAnalysis] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('date-desc')
  const [filterQuestion, setFilterQuestion] = useState('')
  const [filterAnswer, setFilterAnswer] = useState('')

  useEffect(() => {
    if (!formId) {
      return
    }

    loadData()
  }, [formId])

  useEffect(() => {
    if (answers.length > 0) {
      filterAndSortAnswers()
    } else if (answers.length === 0 && !loading) {
      // Si pas de réponses après le chargement, afficher vide
      setFilteredAnswers([])
    }
  }, [answers, sortBy, filterQuestion, filterAnswer, loading])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Charger le formulaire
      const formData = await formsApi.getById(formId)
      setForm(formData)
      
      // Charger les réponses et l'analyse
      const [responsesData, analysisData] = await Promise.all([
        responsesApi.getByFormId(formId),
        responsesApi.getAnalysis(formId)
      ])
      
      setAnswers(responsesData)
      setAnalysis(analysisData)
    } catch (err) {
      console.error('Erreur lors du chargement des résultats:', err)
      setError('Formulaire non trouvé ou inaccessible')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortAnswers = () => {
    let filtered = [...answers]

    // Filtrer par question
    if (filterQuestion) {
      filtered = filtered.filter(answer => 
        answer.responses?.some(item => 
          item.question.toLowerCase().includes(filterQuestion.toLowerCase())
        )
      )
    }

    // Filtrer par réponse
    if (filterAnswer) {
      filtered = filtered.filter(answer => 
        answer.responses?.some(item => 
          String(item.answer).toLowerCase().includes(filterAnswer.toLowerCase())
        )
      )
    }

    // Trier
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => {
          // Utiliser le timestamp original pour le tri
          const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
          const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
          return dateB - dateA
        })
        break
      case 'date-asc':
        filtered.sort((a, b) => {
          const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
          const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
          return dateA - dateB
        })
        break
      case 'responses-desc':
        filtered.sort((a, b) => {
          const countA = a.responses?.length || 0
          const countB = b.responses?.length || 0
          return countB - countA
        })
        break
      case 'responses-asc':
        filtered.sort((a, b) => {
          const countA = a.responses?.length || 0
          const countB = b.responses?.length || 0
          return countA - countB
        })
        break
      default:
        break
    }

    console.log('Filtrage appliqué:', {
      originalCount: answers.length,
      filteredCount: filtered.length,
      sortBy,
      filterQuestion,
      filterAnswer
    })

    setFilteredAnswers(filtered)
  }

  const handleReset = () => {
    setFilterQuestion('')
    setFilterAnswer('')
    setSortBy('date-desc')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error}
          </h1>
          <p className="text-gray-600 mb-4">
            Le formulaire que vous cherchez n'existe pas
          </p>
          <Link href="/" className="btn-primary">
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-rose hover:text-rose/70 font-medium mb-4 inline-block">
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {form.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{form.description}</span>
            <span>•</span>
            <span className="font-medium">{answers.length} réponses</span>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-rose mb-2">{answers.length}</div>
            <div className="text-gray-600">Total des réponses</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-rose mb-2">{Object.keys(analysis).length}</div>
            <div className="text-gray-600">Questions analysées</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-rose mb-2">
              {answers.length > 0 ? Math.round(answers.reduce((acc, a) => acc + a.responses.length, 0) / answers.length) : 0}
            </div>
            <div className="text-gray-600">Réponses moyennes</div>
          </div>
        </div>

        {/* Filters and Sort - Nouveau composant */}
        {form && (
          <FilterBox
            form={form}
            answers={answers}
            filteredAnswers={filteredAnswers}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterQuestion={filterQuestion}
            setFilterQuestion={setFilterQuestion}
            filterAnswer={filterAnswer}
            setFilterAnswer={setFilterAnswer}
            onReset={handleReset}
          />
        )}

        {/* Analysis section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analyse des réponses</h2>
          {Object.keys(analysis).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(analysis).map(([question, responses]) => (
                <div key={question} className="card">
                  <h3 className="font-medium text-gray-900 mb-3">{question}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(responses).map(([label, count]) => (
                      <div key={label} className="bg-rose-light rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
                        <div className="text-rose font-semibold">{count} réponse{count > 1 ? 's' : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune analyse disponible
              </h3>
              <p className="text-gray-600">
                Les données d'analyse apparaîtront ici lorsque vous aurez des réponses
              </p>
            </div>
          )}
        </div>

        {/* All answers */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Toutes les réponses</h2>
          {filteredAnswers.length > 0 ? (
            <AnswerList answers={filteredAnswers} />
          ) : (
            <div className="card text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {answers.length > 0 ? 'Aucune réponse ne correspond aux filtres' : 'Aucune réponse'}
              </h3>
              <p className="text-gray-600">
                {answers.length > 0 
                  ? 'Essayez de modifier vos filtres pour voir des réponses'
                  : 'Ce formulaire n\'a pas encore reçu de réponses'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
