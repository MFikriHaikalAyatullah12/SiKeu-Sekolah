import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * Check if user has the required role
 */
export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect("/auth/signin")
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard") // Redirect ke dashboard jika tidak punya akses
  }

  return session
}

/**
 * Check if user is Super Admin
 */
export async function isSuperAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === "SUPER_ADMIN"
}

/**
 * Check if user is Admin or Super Admin
 */
export async function isAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
}

/**
 * Get current user session with role check
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return null
  }

  return session.user
}

/**
 * Client-side role check utilities
 */
export const RolePermissions = {
  // Super Admin bisa akses semua
  canManageSchoolSettings: (role: string) => role === "SUPER_ADMIN",
  
  // Super Admin dan Admin bisa manage users
  canManageUsers: (role: string) => 
    role === "SUPER_ADMIN" || role === "ADMIN",
  
  // Super Admin, Admin, dan Treasurer bisa manage transactions
  canManageTransactions: (role: string) => 
    role === "SUPER_ADMIN" || role === "ADMIN" || role === "TREASURER",
  
  // Semua role bisa view transactions
  canViewTransactions: (role: string) => 
    ["SUPER_ADMIN", "ADMIN", "TREASURER", "USER"].includes(role),
  
  // Super Admin dan Admin bisa view reports
  canViewReports: (role: string) => 
    role === "SUPER_ADMIN" || role === "ADMIN",
  
  // Super Admin bisa manage semua schools
  canManageAllSchools: (role: string) => role === "SUPER_ADMIN",
}
