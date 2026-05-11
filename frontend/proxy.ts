import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname === '/auth'
  const isProtectedRoute = pathname.startsWith('/home') || pathname.startsWith('/edit')

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/auth',
    '/home/:path*',
    '/edit/:path*',
  ],
}