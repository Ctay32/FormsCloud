'use client'

import { useState } from 'react'

export default function FilterBox({
  form,
  answers,
  filteredAnswers,
  sortBy,
  setSortBy,
  filterQuestion,
  setFilterQuestion,
  filterAnswer,
  setFilterAnswer,
  onReset
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [filterDateRange, setFilterDateRange] = useState('all')

  const handleReset = () => {
    setFilterQuestion('')
    setFilterAnswer('')
    setFilterDate('')
    setFilterDateRange('all')
    setSortBy('date-desc')
    onReset()
  }

  const isFiltered = filterQuestion || filterAnswer || filterDate || filterDateRange !== 'all'

  const exportToCSV = () => {
    if (filteredAnswers.length === 0) {
      alert('Aucune réponse à exporter')
      return
    }

    // Créer le CSV
    let csv = 'Date,Questions répondues\n'
    
    filteredAnswers.forEach(answer => {
      const date = answer.date || new Date().toLocaleDateString('fr-FR')
      const questionCount = answer.responses?.length || 0
      csv += `"${date}","${questionCount}"\n`
    })

    // Créer le blob et télécharger
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reponses_${form.id}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="card mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Filtres et tri</h3>
          {isFiltered && (
            <span className="ml-2 px-2 py-1 bg-rose/10 text-rose text-xs font-medium rounded-full">
              Filtres actifs
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-rose hover:text-rose/70 font-medium flex items-center gap-1"
        >
          {showAdvanced ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Masquer les filtres avancés
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Filtres avancés
            </>
          )}
        </button>
      </div>

      {/* Filtres principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Tri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Trier par
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
          >
            <option value="date-desc">📅 Date (plus récent)</option>
            <option value="date-asc">📅 Date (plus ancien)</option>
            <option value="responses-desc">📊 Réponses (plus)</option>
            <option value="responses-asc">📊 Réponses (moins)</option>
          </select>
        </div>

        {/* Filtre par question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Rechercher question
          </label>
          <input
            type="text"
            value={filterQuestion}
            onChange={(e) => setFilterQuestion(e.target.value)}
            placeholder="Ex: email, âge..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
          />
        </div>

        {/* Filtre par réponse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Rechercher réponse
          </label>
          <input
            type="text"
            value={filterAnswer}
            onChange={(e) => setFilterAnswer(e.target.value)}
            placeholder="Ex: oui, texte..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 items-end">
          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="flex-1 px-3 py-2 bg-rose/10 hover:bg-rose/20 text-rose font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-rose" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v4a1 1 0 001 1h2a2 2 0 012 2v5a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h2a1 1 0 001-1V3z" />
            </svg>
            Filtres avancés
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plage de dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plage de dates
              </label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            {/* Date personnalisée */}
            {filterDateRange === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                />
              </div>
            )}

            {/* Statistiques de filtre */}
            <div className="md:col-span-2 p-3 bg-gradient-to-r from-rose/5 to-blue-50/10 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-2xl font-bold text-rose">{filteredAnswers.length}</div>
                  <div className="text-gray-600">Affichées</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-400">/</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">{answers.length}</div>
                  <div className="text-gray-600">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Résumé des filtres actifs */}
      {isFiltered && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filterQuestion && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-rose/10 text-rose text-sm rounded-full">
                🔍 Question: "{filterQuestion}"
                <button
                  onClick={() => setFilterQuestion('')}
                  className="hover:bg-rose/20 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}
            {filterAnswer && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-rose/10 text-rose text-sm rounded-full">
                ✓ Réponse: "{filterAnswer}"
                <button
                  onClick={() => setFilterAnswer('')}
                  className="hover:bg-rose/20 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}
            {filterDateRange !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-rose/10 text-rose text-sm rounded-full">
                📅 {filterDateRange === 'today' ? "Aujourd'hui" : filterDateRange === 'week' ? 'Cette semaine' : 'Ce mois'}
                <button
                  onClick={() => {
                    setFilterDateRange('all')
                    setFilterDate('')
                  }}
                  className="hover:bg-rose/20 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
