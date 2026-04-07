'use client'

import { useState, useEffect } from 'react'
import { formsApi } from '../lib/api'

export default function TestPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testDatabase = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog('🔍 Test de la base de données...')
      
      // 1. Test de création
      addLog('📝 Test de création d\'un formulaire...')
      const newForm = await formsApi.create({
        title: 'Test de formulaire',
        description: 'Formulaire de test',
        questions: [
          {
            text: 'Question test',
            type: 'short_answer',
            required: true,
            placeholder: 'Réponse test'
          },
          {
            text: 'Choix multiple test',
            type: 'multiple_choice',
            required: false,
            options: ['Option 1', 'Option 2', 'Option 3']
          }
        ]
      })
      
      addLog(`✅ Formulaire créé: ${newForm.id}`)
      
      // 2. Test de lecture
      addLog('📖 Test de lecture du formulaire...')
      const readForm = await formsApi.getById(newForm.id)
      addLog(`✅ Formulaire lu: ${readForm.questions.length} questions`)
      
      // 3. Test de mise à jour
      addLog('✏️ Test de mise à jour du formulaire...')
      await formsApi.update(newForm.id, {
        title: 'Test de formulaire modifié',
        description: 'Formulaire de test modifié',
        questions: [
          {
            text: 'Question modifiée',
            type: 'long_answer',
            required: true,
            placeholder: 'Réponse modifiée'
          },
          {
            text: 'Nouvelle question',
            type: 'dropdown',
            required: false,
            options: ['A', 'B', 'C']
          }
        ]
      })
      
      addLog('✅ Formulaire mis à jour')
      
      // 4. Test de relecture
      addLog('📖 Test de relecture après modification...')
      const updatedForm = await formsApi.getById(newForm.id)
      addLog(`✅ Formulaire relu: ${updatedForm.questions.length} questions`)
      
      updatedForm.questions.forEach((q, i) => {
        addLog(`   Question ${i + 1}: ${q.type} - ${q.text}`)
        if (q.options) addLog(`   Options: ${q.options.join(', ')}`)
        if (q.settings) addLog(`   Settings: ${JSON.stringify(q.settings)}`)
      })
      
      addLog('🎉 Tous les tests réussis !')
      
    } catch (error) {
      addLog(`❌ Erreur: ${error.message}`)
      console.error('Erreur de test:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test de la base de données</h1>
        
        <div className="mb-6">
          <button
            onClick={testDatabase}
            disabled={loading}
            className="btn-primary px-6 py-3"
          >
            {loading ? 'Test en cours...' : 'Lancer les tests'}
          </button>
        </div>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">Cliquez sur "Lancer les tests" pour commencer...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Exécutez d'abord le script de migration <code>migration-questions.sql</code> dans Supabase</li>
            <li>Cliquez sur "Lancer les tests" pour vérifier que tout fonctionne</li>
            <li>Les logs montrent chaque étape du processus</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
