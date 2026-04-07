'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DiagnosticPage() {
  const [dbInfo, setDbInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runDiagnostic = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('DIAG: Début du diagnostic de la base de données')
      
      // 1. Vérifier la structure de la table questions
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'questions' })
      
      if (columnsError && !columnsError.message.includes('function')) {
        console.error('DIAG: Erreur colonnes:', columnsError)
      }
      
      // 2. Compter les questions par type
      const { data: typeCounts, error: typeError } = await supabase
        .from('questions')
        .select('type')
        .then(({ data }) => {
          const counts = {}
          data?.forEach(q => {
            counts[q.type] = (counts[q.type] || 0) + 1
          })
          return counts
        })
      
      // 3. Vérifier quelques questions
      const { data: sampleQuestions, error: sampleError } = await supabase
        .from('questions')
        .select('*')
        .limit(5)
      
      // 4. Compter les formulaires et questions
      const { count: formCount, error: formError } = await supabase
        .from('forms')
        .select('*', { count: 'exact', head: true })
      
      const { count: questionCount, error: questionError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
      
      // 5. Tester l'insertion d'une question
      const testForm = await supabase
        .from('forms')
        .insert([{ title: 'Test diagnostic', description: 'Test' }])
        .select()
        .single()
      
      const testQuestion = await supabase
        .from('questions')
        .insert([{
          form_id: testForm.data.id,
          text: 'Question test',
          type: 'short_answer',
          required: true,
          options: ['test'],
          settings: { placeholder: 'test' }
        }])
        .select()
        .single()
      
      // Nettoyer le test
      await supabase.from('questions').delete().eq('id', testQuestion.data.id)
      await supabase.from('forms').delete().eq('id', testForm.data.id)
      
      setDbInfo({
        formCount: formCount || 0,
        questionCount: questionCount || 0,
        typeCounts: typeCounts || {},
        sampleQuestions: sampleQuestions || [],
        testSuccess: !!testQuestion.data
      })
      
      console.log('DIAG: Diagnostic terminé avec succès')
      
    } catch (err) {
      console.error('DIAG: Erreur de diagnostic:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Diagnostic de la base de données</h1>
        
        <div className="mb-6">
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="btn-primary px-6 py-3"
          >
            {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Erreur détectée :</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {dbInfo && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Formulaires :</span>
                  <span className="ml-2 font-bold">{dbInfo.formCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Questions :</span>
                  <span className="ml-2 font-bold">{dbInfo.questionCount}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Types de questions</h2>
              <div className="space-y-2">
                {Object.entries(dbInfo.typeCounts).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="font-mono">{type}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Test d'insertion</h2>
              <div className={`p-4 rounded ${dbInfo.testSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {dbInfo.testSuccess ? '✅ Test réussi : Les questions peuvent être insérées' : '❌ Test échoué : Problème d\'insertion'}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Exemples de questions</h2>
              <div className="space-y-4">
                {dbInfo.sampleQuestions.map((q, i) => (
                  <div key={q.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="font-mono text-sm">{q.type}</div>
                    <div className="font-semibold">{q.text}</div>
                    {q.options && <div className="text-sm text-gray-600">Options: {JSON.stringify(q.options)}</div>}
                    {q.settings && <div className="text-sm text-gray-600">Settings: {JSON.stringify(q.settings)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions si problème détecté :</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Si le test d'insertion échoue, exécutez la migration <code>migration-questions.sql</code></li>
            <li>Si les types de questions sont incorrects, la migration n'a pas été appliquée</li>
            <li>Vérifiez les logs de la console pour plus de détails</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
