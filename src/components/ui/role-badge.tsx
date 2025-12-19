import { Badge } from "@/components/ui/badge"

interface RoleBadgeProps {
  role: string
  size?: "sm" | "md" | "lg"
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          label: "Super Admin",
          icon: "👑",
          className: "bg-purple-100 text-purple-800 border-purple-300"
        }
      case "ADMIN":
        return {
          label: "Admin",
          icon: "🔑",
          className: "bg-blue-100 text-blue-800 border-blue-300"
        }
      case "TREASURER":
        return {
          label: "Bendahara",
          icon: "💰",
          className: "bg-green-100 text-green-800 border-green-300"
        }
      case "USER":
        return {
          label: "User",
          icon: "👤",
          className: "bg-gray-100 text-gray-800 border-gray-300"
        }
      default:
        return {
          label: role,
          icon: "❓",
          className: "bg-gray-100 text-gray-800 border-gray-300"
        }
    }
  }

  const config = getRoleConfig(role)
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  }

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} font-semibold border`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  )
}

export function getRoleDescription(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Akses penuh ke semua fitur sistem dan semua sekolah"
    case "ADMIN":
      return "Mengelola transaksi, laporan, dan pengguna sekolah"
    case "TREASURER":
      return "Mengelola transaksi keuangan sekolah"
    case "USER":
      return "Melihat transaksi dan dashboard"
    default:
      return "Role tidak diketahui"
  }
}
