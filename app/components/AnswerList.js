export default function AnswerList({ answers }) {
  return (
    <div className="space-y-4">
      {answers.map((answer, index) => (
        <div key={index} className="card">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm text-gray-500">Réponse #{index + 1}</span>
            <span className="text-xs text-gray-400">{answer.date}</span>
          </div>
          
          <div className="space-y-3">
            {answer.responses.map((response, responseIndex) => (
              <div key={responseIndex}>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {response.question}
                </p>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {response.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
