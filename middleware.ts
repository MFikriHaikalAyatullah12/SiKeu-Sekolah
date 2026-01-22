import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Public routes yang tidak memerlukan authentication
  const publicRoutes = ['/', '/auth/signin', '/auth/register']
  const isPublicRoute = publicRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  )
  
  // Skip middleware for API auth routes and static files
  if (pathname.startsWith('/api/auth') || 
      pathname.startsWith('/_next') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Get token - use the same cookie name as configured in auth.ts
  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.session-token",
  })

  // Jika tidak ada token dan bukan public route, redirect ke login
  if (!token && !isPublicRoute) {
    const signInUrl = new URL('/auth/signin', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Jika ada token dan mengakses landing page, redirect ke dashboard
  if (pathname === '/' && token) {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)"
  ]
}