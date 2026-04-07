'use client'

import { useState } from 'react'
import { auth } from '../lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        // Inscription
        const { data, error } = await auth.signUp(email, password)
        
        if (error) {
          setError(error.message)
        } else {
          setMessage('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
          setTimeout(() => {
            router.push('/')
          }, 3000)
        }
      } else {
        // Connexion
        const { data, error } = await auth.signIn(email, password)
        
        if (error) {
          setError(error.message)
        } else {
          router.push('/')
        }
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose/10 via-white to-blue-50/10 flex items-center justify-center relative overflow-hidden">
      {/* Décoration de fond */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md mx-auto px-4 py-6">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          {/* Logo stylisé */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20 bg-gradient-to-br from-rose to-rose/70 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              {/* Icône de formulaire stylisée */}
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose via-rose/80 to-rose/60 bg-clip-text text-transparent mb-3">
            FormCloud
          </h1>

          {/* Sous-titre */}
          {isSignUp ? (
            <div>
              <p className="text-xl font-medium text-gray-900 mb-2">Bienvenue!</p>
              <p className="text-gray-600">Créez votre compte et commencez à créer des formulaires</p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-medium text-gray-900 mb-2">Content de te revoir!</p>
              <p className="text-gray-600">Connecte-toi pour accéder à tes formulaires</p>
            </div>
          )}
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-sm p-8">
          
          {/* Messages d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Message de succès */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-700 text-sm">{message}</span>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose transition-all duration-200"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              {isSignUp && (
                <p className="mt-2 text-xs text-gray-500">
                  Minimum 6 caractères pour la sécurité
                </p>
              )}
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-rose to-rose/80 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isSignUp ? 'Création en cours...' : 'Connexion en cours...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSignUp ? "M12 4v16m8-8H4" : "M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"} />
                  </svg>
                  <span>{isSignUp ? 'Créer un compte' : 'Se connecter'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-500 font-medium">OU</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Basculer inscription/connexion */}
          <div className="text-center p-4 bg-gradient-to-r from-rose/5 to-blue-50/10 rounded-lg">
            <p className="text-sm text-gray-700">
              {isSignUp ? (
                <>
                  Tu as déjà un compte?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false)
                      setError(null)
                      setMessage(null)
                    }}
                    className="font-semibold text-rose hover:text-rose/70 transition-colors"
                  >
                    Connecte-toi
                  </button>
                </>
              ) : (
                <>
                  Tu n'as pas de compte?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setError(null)
                      setMessage(null)
                    }}
                    className="font-semibold text-rose hover:text-rose/70 transition-colors"
                  >
                    Créen un
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>
            En utilisant FormCloud, tu acceptes nos{' '}
            <button className="text-rose hover:underline">conditions d'utilisation</button>
          </p>
        </div>

        {/* Features rapides */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-rose/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-700">Rapide</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-rose/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-700">Sécurisé</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-rose/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-700">Facile</p>
          </div>
        </div>
      </div>
    </div>
  )
}
