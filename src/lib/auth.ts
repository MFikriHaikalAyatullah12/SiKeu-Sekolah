import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolProfileId ?? "",
          }
        } catch (err) {
          // Common root cause in dev: DATABASE_URL missing or DB not reachable
          console.error("❌ Auth authorize error:", err)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.schoolId = user.schoolId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.schoolId = token.schoolId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}