import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Public routes yang tidak memerlukan authentication
    const publicRoutes = ['/', '/auth/signin', '/auth/register', '/api/auth']
    const isPublicRoute = publicRoutes.some(route => 
      route === '/' ? pathname === '/' : pathname.startsWith(route)
    )

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
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Allow access ke public routes tanpa token
        const publicRoutes = ['/', '/auth/signin', '/auth/register', '/api/auth']
        if (publicRoutes.some(route => 
          route === '/' ? pathname === '/' : pathname.startsWith(route)
        )) {
          return true
        }

        // Require token untuk semua route lainnya
        return !!token
      }
    }
  }
)

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