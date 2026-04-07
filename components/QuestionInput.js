export default function QuestionInput({ question, index, onChange, onRemove }) {
  return (
    <div className="card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
        {onRemove && (
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Supprimer
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte de la question
          </label>
          <input
            type="text"
            value={question.text}
            onChange={(e) => onChange(index, 'text', e.target.value)}
            placeholder="Ex: Comment évaluez-vous notre service ?"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de réponse
          </label>
          <select
            value={question.type}
            onChange={(e) => onChange(index, 'type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/50 focus:border-rose"
          >
            <option value="text">Texte libre</option>
            <option value="choice">Choix multiple</option>
          </select>
        </div>
      </div>
    </div>
  )
}
