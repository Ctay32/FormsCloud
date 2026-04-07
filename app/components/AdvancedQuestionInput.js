'use client'

import { useState } from 'react'

export default function AdvancedQuestionInput({ question, index, onChange, onRemove }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (field, value) => {
    onChange(index, field, value)
  }

  const handleOptionChange = (optIndex, value) => {
    const newOptions = [...(question.options || [])]
    newOptions[optIndex] = value
    handleChange('options', newOptions)
  }

  const addOption = () => {
    const newOptions = [...(question.options || [''])]
    newOptions.push('')
    handleChange('options', newOptions)
  }

  const removeOption = (optIndex) => {
    const newOptions = [...(question.options || [])]
    newOptions.splice(optIndex, 1)
    handleChange('options', newOptions)
  }

  const handleGridQuestionChange = (rowIndex, colIndex, value) => {
    const gridData = question.gridData || { rows: ['Ligne 1'], columns: ['Colonne 1'] }
    gridData.rows[rowIndex] = value
    handleChange('gridData', gridData)
  }

  const handleGridColumnChange = (colIndex, value) => {
    const gridData = question.gridData || { rows: ['Ligne 1'], columns: ['Colonne 1'] }
    gridData.columns[colIndex] = value
    handleChange('gridData', gridData)
  }

  const addGridRow = () => {
    const gridData = question.gridData || { rows: ['Ligne 1'], columns: ['Colonne 1'] }
    gridData.rows.push(`Ligne ${gridData.rows.length + 1}`)
    handleChange('gridData', gridData)
  }

  const addGridColumn = () => {
    const gridData = question.gridData || { rows: ['Ligne 1'], columns: ['Colonne 1'] }
    gridData.columns.push(`Colonne ${gridData.columns.length + 1}`)
    handleChange('gridData', gridData)
  }

  return (
    <div className="card p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <input
            type="text"
            value={question.text}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder={`Question ${index + 1}`}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
          />
        </div>
        <button
          onClick={() => onRemove(index)}
          className="ml-2 text-red-500 hover:text-red-700 transition-colors"
          disabled={index === 0}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Options de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type de réponse
          </label>
          <select
            value={question.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
          >
            <option value="short_answer">Réponse courte</option>
            <option value="long_answer">Réponse longue</option>
            <option value="multiple_choice">Choix multiple</option>
            <option value="checkboxes">Cases à cocher</option>
            <option value="dropdown">Liste déroulante</option>
            <option value="linear_scale">Échelle linéaire</option>
            <option value="grid">Grille (tableau)</option>
            <option value="date">Date</option>
            <option value="time">Heure</option>
            <option value="datetime">Date et heure</option>
            <option value="email">Email</option>
            <option value="number">Nombre</option>
            <option value="phone">Téléphone</option>
            <option value="url">URL</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Obligatoire
          </label>
          <select
            value={question.required || 'no'}
            onChange={(e) => handleChange('required', e.target.value === 'yes')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
          >
            <option value="no">Optionnel</option>
            <option value="yes">Obligatoire</option>
          </select>
        </div>
      </div>

      {/* Options spécifiques par type */}
      {(question.type === 'multiple_choice' || question.type === 'checkboxes') && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Options de réponse
          </label>
          <div className="space-y-2">
            {(question.options || ['Option 1', 'Option 2']).map((option, optIndex) => (
              <div key={optIndex} className="flex gap-2">
                <div className="flex items-center">
                  {question.type === 'multiple_choice' && (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  {question.type === 'checkboxes' && (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  )}
                </div>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                  placeholder={`Option ${optIndex + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                />
                {(question.options || ['Option 1', 'Option 2']).length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(optIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-rose hover:text-rose/70 text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une option
            </button>
          </div>
        </div>
      )}

      {question.type === 'dropdown' && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Options de la liste déroulante
          </label>
          <div className="space-y-2">
            {(question.options || ['Option 1', 'Option 2']).map((option, optIndex) => (
              <div key={optIndex} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                  placeholder={`Option ${optIndex + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                />
                {(question.options || ['Option 1', 'Option 2']).length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(optIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-rose hover:text-rose/70 text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une option
            </button>
          </div>
        </div>
      )}

      {question.type === 'linear_scale' && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Configuration de l'échelle
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Étiquette de début</label>
              <input
                type="text"
                value={question.scaleStart || 'Pas du tout d\'accord'}
                onChange={(e) => handleChange('scaleStart', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Nombre d'options</label>
              <select
                value={question.scaleSteps || 5}
                onChange={(e) => handleChange('scaleSteps', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={7}>7</option>
                <option value={10}>10</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Étiquette de fin</label>
              <input
                type="text"
                value={question.scaleEnd || 'Tout à fait d\'accord'}
                onChange={(e) => handleChange('scaleEnd', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {question.type === 'grid' && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Configuration de la grille
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Lignes</label>
              <div className="space-y-1">
                {(question.gridData?.rows || ['Ligne 1']).map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={row}
                      onChange={(e) => handleGridQuestionChange(rowIndex, 0, e.target.value)}
                      placeholder={`Ligne ${rowIndex + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                    />
                    {(question.gridData?.rows || ['Ligne 1']).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const gridData = question.gridData || { rows: ['Ligne 1'], columns: ['Colonne 1'] }
                          gridData.rows.splice(rowIndex, 1)
                          handleChange('gridData', gridData)
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGridRow}
                  className="text-rose hover:text-rose/70 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une ligne
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Colonnes</label>
              <div className="space-y-1">
                {(question.gridData?.columns || ['Colonne 1']).map((col, colIndex) => (
                  <div key={colIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => handleGridColumnChange(colIndex, e.target.value)}
                      placeholder={`Colonne ${colIndex + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                    />
                    {(question.gridData?.columns || ['Colonne 1']).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const gridData = question.gridData || { rows: ['Ligne 1'], columns: ['Colonne 1'] }
                          gridData.columns.splice(colIndex, 1)
                          handleChange('gridData', gridData)
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGridColumn}
                  className="text-rose hover:text-rose/70 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une colonne
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Options avancées */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-rose hover:text-rose/70 font-medium flex items-center gap-1 mb-3"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Options avancées
          {showAdvanced ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {showAdvanced && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Texte d'aide
                </label>
                <input
                  type="text"
                  value={question.helpText || ''}
                  onChange={(e) => handleChange('helpText', e.target.value)}
                  placeholder="Texte d'aide pour cette question"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={question.placeholder || ''}
                  onChange={(e) => handleChange('placeholder', e.target.value)}
                  placeholder="Texte indicatif dans le champ"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                />
              </div>
            </div>

            {/* Validation pour les nombres */}
            {question.type === 'number' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Minimum
                  </label>
                  <input
                    type="number"
                    value={question.min || ''}
                    onChange={(e) => handleChange('min', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Maximum
                  </label>
                  <input
                    type="number"
                    value={question.max || ''}
                    onChange={(e) => handleChange('max', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Précision
                  </label>
                  <input
                    type="number"
                    value={question.precision || '0'}
                    onChange={(e) => handleChange('precision', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                  />
                </div>
              </div>
            )}

            {/* Validation pour les dates */}
            {(question.type === 'date' || question.type === 'datetime') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Format de date
                </label>
                <select
                  value={question.dateFormat || 'YYYY-MM-DD'}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                >
                  <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
                  <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                  <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                </select>
              </div>
            )}

            {/* Validation pour les URLs */}
            {question.type === 'url' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`url-https-${index}`}
                  checked={question.requireHttps || false}
                  onChange={(e) => handleChange('requireHttps', e.target.checked)}
                  className="rounded border-gray-300 text-rose focus:ring-rose"
                />
                <label htmlFor={`url-https-${index}`} className="text-xs text-gray-700">
                  Exiger HTTPS
                </label>
              </div>
            )}

            {/* Validation pour les téléphones */}
            {question.type === 'phone' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Format du numéro
                </label>
                <select
                  value={question.phoneFormat || 'international'}
                  onChange={(e) => handleChange('phoneFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose text-sm"
                >
                  <option value="international">International (+33 1 23 45 67 89)</option>
                  <option value="national">National (01 23 45 67 89)</option>
                  <option value="mobile">Mobile (06 12 34 56 78)</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
