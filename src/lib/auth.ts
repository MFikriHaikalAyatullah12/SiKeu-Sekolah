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
    updateAge: 5 * 60, // Update session setiap 5 menit
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🔐 JWT callback - User from login:", {
          id: user.id,
          schoolId: user.schoolId,
          role: user.role
        })
        token.role = user.role
        token.schoolId = user.schoolId
      }
      console.log("🎫 JWT token:", {
        sub: token.sub,
        role: token.role,
        schoolId: token.schoolId
      })
      return token
    },
    async session({ session, token }) {
      // Keep this callback non-throwing so /api/auth/session always returns JSON.
      if (!session.user) {
        // Defensive fallback (shouldn't normally happen, but avoids runtime crashes).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        
        // CRITICAL FIX: If schoolId is empty or null, fetch from database
        if (session.user.id && (!session.user.schoolId || session.user.schoolId === "")) {
          console.log("🔍 School ID missing in session, fetching from database...")
          try {
            const user = await prisma.user.findUnique({
              where: { id: session.user.id },
              select: { schoolProfileId: true }
            })
            if (user?.schoolProfileId) {
              session.user.schoolId = user.schoolProfileId
              console.log("✅ Updated session with schoolId from database:", session.user.schoolId)
            } else {
              console.log("⚠️  No schoolProfileId found in database for user:", session.user.id)
            }
          } catch (error) {
            console.error("❌ Error fetching school ID from database:", error)
          }
        }
        
        console.log("📋 Final session - User ID:", session.user.id, "School ID:", session.user.schoolId)
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
        secure: process.env.NODE_ENV === "production",
        // Tidak ada maxAge - cookie akan hilang saat browser ditutup
      },
    },
  },
}