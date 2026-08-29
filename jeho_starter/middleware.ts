import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/dashboard-legacy']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.get('__session')?.value === '1'
  if (hasSession) {
    return NextResponse.next()
  }

  const url = new URL('/auth/login', request.url)
  url.searchParams.set('next', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}
