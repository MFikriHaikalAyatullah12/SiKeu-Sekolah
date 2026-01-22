import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: (() => {
    const providers: NextAuthOptions["providers"] = [
      CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email atau Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const identifier = credentials?.email?.trim()
        console.log("🔐 Login attempt:", identifier)

        if (!identifier || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        try {
          // Login by email (unique) OR by name (treated as username for MVP)
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: { equals: identifier, mode: "insensitive" } },
                { name: { equals: identifier, mode: "insensitive" } },
              ],
            },
          })

          console.log(
            "👤 User found:",
            user ? `${user.email} (${user.role})` : "NOT FOUND"
          )

          if (!user || !user.password) {
            console.log("❌ User not found or no password")
            return null
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          )
          console.log("🔑 Password match:", passwordMatch ? "✅" : "❌")

          if (!passwordMatch) return null

          console.log("✅ Login successful:", user.email)
          console.log("🏢 User school ID:", user.schoolProfileId)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolProfileId || "", // Use empty string instead of null
          }
        } catch (err) {
          // Common root cause in dev: DATABASE_URL missing or DB not reachable
          console.error("❌ Auth authorize error:", err)
          return null
        }
      }
    }),
    ]

    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (googleClientId && googleClientSecret) {
      providers.push(
        GoogleProvider({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        })
      )
    }

    return providers
  })(),
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 menit (1800 seconds)
    updateAge: 10 * 60, // Update session every 10 minutes (reduced frequency)
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Only update token when user logs in (not on every request)
      if (user) {
        console.log("🔐 JWT callback - User from login:", {
          id: user.id,
          schoolId: user.schoolId,
          role: user.role
        })
        token.role = user.role
        token.schoolId = user.schoolId
        
        // If schoolId is missing during login, fetch from DB once
        if (!token.schoolId || token.schoolId === "") {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { schoolProfileId: true }
            })
            if (dbUser?.schoolProfileId) {
              token.schoolId = dbUser.schoolProfileId
              console.log("✅ Fetched schoolId from DB during login:", token.schoolId)
            }
          } catch (error) {
            console.error("❌ Error fetching schoolId:", error)
          }
        }
      }
      // Remove excessive logging in production
      if (process.env.NODE_ENV === 'development') {
        console.log("🎫 JWT token:", { sub: token.sub, role: token.role, schoolId: token.schoolId })
      }
      return token
    },
    async session({ session, token }) {
      // Keep this callback non-throwing so /api/auth/session always returns JSON.
      if (!session.user) {
        session.user = {} as any
      }

      if (token) {
        if (token.sub) {
          session.user.id = token.sub
        }
        if (typeof token.role === "string") {
          session.user.role = token.role
        }
        if (typeof token.schoolId === "string") {
          session.user.schoolId = token.schoolId
        }
      }
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log("📋 Session:", { userId: session.user.id, schoolId: session.user.schoolId })
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
}