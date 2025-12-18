import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      schoolId: string
    }
  }

  interface User {
    role: string
    schoolId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    schoolId: string
  }
}