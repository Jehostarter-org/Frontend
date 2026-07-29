import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const allowed = [
    '/',
    '/auth',
    '/not-found',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/images',
    '/fonts',
  ]

  if (allowed.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.get('__session')?.value === '1'
  if (hasSession) {
    return NextResponse.next()
  }

  const url = new URL('/not-found', request.url)
  url.searchParams.set('from', pathname)
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)'],
}
