'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formsApi, responsesApi } from '../../lib/api'

export default function FormPage({ params }) {
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadForm()
  }, [params.id])

  const loadForm = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Chargement du formulaire avec ID:', params.id)
      
      const formData = await formsApi.getById(params.id)
      console.log('Données du formulaire reçues:', formData)
      
      setForm(formData)
      
      if (formData.questions) {
        console.log('Questions trouvées:', formData.questions)
        console.log('Nombre de questions:', formData.questions.length)
      } else {
        console.log('Aucune question trouvée dans les données')
      }
    } catch (err) {
      console.error('Erreur lors du chargement du formulaire:', err)
      setError('Formulaire non trouvé ou inaccessible')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if all questions are answered
    const unansweredQuestions = form.questions.filter(q => !answers[q.id])
    if (unansweredQuestions.length > 0) {
      setError('Veuillez répondre à toutes les questions')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      await responsesApi.submit(params.id, answers)
      setIsSubmitted(true)
    } catch (err) {
      console.error('Erreur lors de la soumission:', err)
      setError('Impossible de soumettre votre réponse. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="card text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error}
            </h2>
            <p className="text-gray-600 mb-4">
              Le formulaire que vous cherchez n'existe pas
            </p>
            <a href="/" className="btn-primary">
              Retour au dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Merci pour votre réponse !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre réponse a été enregistrée avec succès.
            </p>
            <a href="/" className="btn-primary">
              Retour au dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {form.title}
            </h1>
            <p className="text-gray-600">
              {form.description}
            </p>
          </div>
          <Link href="/" className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {console.log('Affichage du formulaire - form:', form)}
          {console.log('Affichage - questions:', form?.questions)}
          
          {form && form.questions && form.questions.length > 0 ? (
            form.questions.map((question) => {
              console.log('Affichage de la question:', question)
              return (
            <div key={question.id} className="card">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {/* Réponse courte */}
              {(question.type === 'short_answer' || question.type === 'text') && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder={question.placeholder || "Votre réponse..."}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                />
              )}

              {/* Réponse longue */}
              {question.type === 'long_answer' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder={question.placeholder || "Votre réponse..."}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                />
              )}

              {/* Choix multiple */}
              {(question.type === 'multiple_choice' || question.type === 'choice') && (
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mr-2"
                        required={question.required}
                        disabled={submitting}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Cases à cocher */}
              {question.type === 'checkboxes' && (
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        value={option}
                        checked={answers[question.id]?.includes(option) || false}
                        onChange={(e) => {
                          const currentAnswers = answers[question.id] || []
                          if (e.target.checked) {
                            handleAnswerChange(question.id, [...currentAnswers, option])
                          } else {
                            handleAnswerChange(question.id, currentAnswers.filter(a => a !== option))
                          }
                        }}
                        className="mr-2"
                        disabled={submitting}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Liste déroulante */}
              {question.type === 'dropdown' && (
                <select
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                >
                  <option value="">Sélectionnez une option...</option>
                  {question.options?.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              )}

              {/* Échelle linéaire */}
              {question.type === 'linear_scale' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{question.scaleStart || 'Pas du tout d\'accord'}</span>
                    <span>{question.scaleEnd || 'Tout à fait d\'accord'}</span>
                  </div>
                  <div className="flex justify-between">
                    {Array.from({ length: question.scaleSteps || 5 }, (_, i) => i + 1).map((value) => (
                      <label key={value} className="flex flex-col items-center">
                        <input
                          type="radio"
                          name={`scale-${question.id}`}
                          value={value.toString()}
                          checked={answers[question.id] === value.toString()}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="mb-1"
                          required={question.required}
                          disabled={submitting}
                        />
                        <span className="text-xs">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Grille */}
              {question.type === 'grid' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 text-left"></th>
                        {question.gridData?.columns?.map((col, index) => (
                          <th key={index} className="border border-gray-300 p-2 text-center">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {question.gridData?.rows?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="border border-gray-300 p-2 font-medium">{row}</td>
                          {question.gridData?.columns?.map((col, colIndex) => (
                            <td key={colIndex} className="border border-gray-300 p-2 text-center">
                              <input
                                type="radio"
                                name={`grid-${question.id}-${rowIndex}`}
                                value={col}
                                checked={answers[question.id]?.[rowIndex] === col}
                                onChange={(e) => {
                                  const currentAnswers = answers[question.id] || {}
                                  currentAnswers[rowIndex] = e.target.value
                                  handleAnswerChange(question.id, currentAnswers)
                                }}
                                required={question.required}
                                disabled={submitting}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Date */}
              {question.type === 'date' && (
                <input
                  type="date"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                />
              )}

              {/* Heure */}
              {question.type === 'time' && (
                <input
                  type="time"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                />
              )}

              {/* Date et heure */}
              {question.type === 'datetime' && (
                <input
                  type="datetime-local"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                />
              )}

              {/* Email */}
              {question.type === 'email' && (
                <input
                  type="email"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                />
              )}

              {/* Nombre */}
              {question.type === 'number' && (
                <input
                  type="number"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Entrez un nombre"
                  min={question.min}
                  max={question.max}
                  step={question.precision ? `0.${'0'.repeat(question.precision - 1)}1` : '1'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                />
              )}

              {/* Téléphone */}
              {question.type === 'phone' && (
                <input
                  type="tel"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                />
              )}

              {/* URL */}
              {question.type === 'url' && (
                <input
                  type="url"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
                  required={question.required}
                  disabled={submitting}
                />
              )}

              {/* Fallback pour les types non supportés */}
              {!['text', 'short_answer', 'long_answer', 'choice', 'multiple_choice', 'checkboxes', 'dropdown', 'linear_scale', 'grid', 'date', 'time', 'datetime', 'email', 'number', 'phone', 'url'].includes(question.type) && (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <span className="text-gray-600">Type de question non supporté: {question.type}</span>
                </div>
              )}

              {/* Texte d'aide */}
              {question.helpText && (
                <p className="text-xs text-gray-500 mt-2">{question.helpText}</p>
              )}
            </div>
              )
            })
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-600">
                {form ? 'Ce formulaire n\'a pas de questions' : 'Chargement du formulaire...'}
              </p>
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi...
                </>
              ) : (
                'Envoyer ma réponse'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
