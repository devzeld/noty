import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  if (!token && request.nextUrl.pathname.startsWith('/home')) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/home/:path*',
  ],
}