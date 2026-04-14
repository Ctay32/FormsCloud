import { serve } from 'std/server'

serve(async (req) => {
  // TODO: Récupérer la réponse à analyser depuis req
  // TODO: Appeler l'API LLM (OpenAI, etc.)
  // TODO: Retourner l'analyse
  return new Response(JSON.stringify({ result: 'Not implemented yet' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
