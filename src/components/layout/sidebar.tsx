'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  Home,
  TrendingUp,
  Settings,
  FileText,
  Users,
  Menu,
  Building2,
  Shield,
  Receipt,
} from 'lucide-react'

import appLogoImage from '@/image/icon_tampilan-sekolah1.png'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['SUPER_ADMIN', 'ADMIN', 'TREASURER', 'USER'] },
  { name: 'Transaksi', href: '/dashboard/transactions', icon: TrendingUp, roles: ['SUPER_ADMIN', 'ADMIN', 'TREASURER'] },
  { name: 'Laporan', href: '/dashboard/reports', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Kwitansi', href: '/dashboard/receipts', icon: Receipt, roles: ['SUPER_ADMIN', 'ADMIN', 'TREASURER'] },
  { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN', 'TREASURER', 'USER'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Filter navigation berdasarkan role user
  const filteredNavigation = navigation.filter(item => {
    if (!session?.user?.role) return false
    return item.roles.includes(session.user.role)
  })

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col flex-grow bg-gradient-to-b from-gray-900 to-gray-800 overflow-y-auto shadow-xl">
        <div className="flex items-center h-16 flex-shrink-0 px-6 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="white flex items-center justify-center rounded-full bg-white/100 size-8">
              <Image
                src={appLogoImage}
                alt="Logo SiKeu Sekolah"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
                priority
              />
            </div>
            <h1 className="text-white text-lg font-bold">
              SiKeu Sekolah
            </h1>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-800/50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {session?.user?.role === 'SUPER_ADMIN' && '👑 Super Admin'}
                {session?.user?.role === 'ADMIN' && '🔑 Admin'}
                {session?.user?.role === 'TREASURER' && '💰 Bendahara'}
                {session?.user?.role === 'USER' && '👤 User'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}