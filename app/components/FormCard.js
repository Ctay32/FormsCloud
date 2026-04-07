export default function FormCard({ form, onView, onAnswers }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{form.date}</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-rose-light text-rose px-3 py-1 rounded-full text-xs font-medium">
            {form.responses} réponses
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {form.description}
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={onView}
          className="btn-secondary text-sm px-4 py-2"
        >
          Voir
        </button>
        <button
          onClick={onAnswers}
          className="btn-primary text-sm px-4 py-2"
        >
          Réponses
        </button>
      </div>
    </div>
  )
}
