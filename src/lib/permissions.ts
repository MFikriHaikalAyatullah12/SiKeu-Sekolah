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
 * Check if user is Bendahara/Treasurer
 */
export async function isTreasurer() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === "TREASURER"
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
 * Get date range based on user role
 * Treasurer: 1-3 bulan terakhir
 * Super Admin: Unlimited
 */
export function getDateRangeForRole(role: string) {
  if (role === "SUPER_ADMIN") {
    return null // No restrictions
  }
  
  if (role === "TREASURER") {
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999) // End of today
    
    // Start from first day of 3 months ago (consistent with dashboard)
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1, 0, 0, 0, 0)
    return { startDate, endDate }
  }
  
  // Default: 6 bulan terakhir untuk role lain
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)
  
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1, 0, 0, 0, 0)
  return { startDate, endDate }
}

/**
 * Client-side role check utilities
 */
export const RolePermissions = {
  // Super Admin bisa akses semua
  canManageSchoolSettings: (role: string) => role === "SUPER_ADMIN",
  
  // Hanya Super Admin yang bisa manage users
  canManageUsers: (role: string) => role === "SUPER_ADMIN",
  
  // Super Admin dan Treasurer bisa manage transactions
  canManageTransactions: (role: string) => 
    role === "SUPER_ADMIN" || role === "TREASURER",
  
  // Super Admin dan Treasurer bisa view transactions
  canViewTransactions: (role: string) => 
    ["SUPER_ADMIN", "TREASURER"].includes(role),
  
  // Hanya Super Admin bisa view unlimited reports
  canViewUnlimitedReports: (role: string) => role === "SUPER_ADMIN",
  
  // Super Admin dan Treasurer bisa view limited reports
  canViewReports: (role: string) => 
    role === "SUPER_ADMIN" || role === "TREASURER",
  
  // Hanya Super Admin yang bisa manage COA
  canManageCOA: (role: string) => role === "SUPER_ADMIN",
  
  // Hanya Super Admin yang bisa manage form configuration
  canManageFormConfig: (role: string) => role === "SUPER_ADMIN",
  
  // Super Admin bisa manage semua schools
  canManageAllSchools: (role: string) => role === "SUPER_ADMIN",
  
  // Check if user can access all COA categories (Super Admin only)
  canAccessAllCOA: (role: string) => role === "SUPER_ADMIN",
  
  // Check if user has time restrictions on transaction history
  hasTimeRestrictions: (role: string) => role === "TREASURER",
}
