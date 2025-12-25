import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Public routes yang tidak memerlukan authentication
    const publicRoutes = ['/auth/signin', '/auth/register', '/api/auth']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Jika tidak ada token dan bukan public route, redirect ke login
    if (!token && !isPublicRoute) {
      const signInUrl = new URL('/auth/signin', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Jika ada token tapi mengakses halaman utama, redirect ke login untuk security
    if (pathname === '/' && token) {
      const signInUrl = new URL('/auth/signin', req.url)
      return NextResponse.redirect(signInUrl)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Allow access ke public routes tanpa token
        const publicRoutes = ['/auth/signin', '/auth/register', '/api/auth']
        if (publicRoutes.some(route => pathname.startsWith(route))) {
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