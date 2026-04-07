import { NextResponse } from 'next/server'

export function proxy(request) {
  // Proxy actif mais pas de modifications pour l'instant
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
