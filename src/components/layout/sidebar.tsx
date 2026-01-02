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
  BookOpen,
  X
} from 'lucide-react'

import appLogoImage from '@/image/icon_tampilan-sekolah1.png'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['SUPER_ADMIN', 'TREASURER'] },
  { name: 'Transaksi', href: '/dashboard/transactions', icon: TrendingUp, roles: ['SUPER_ADMIN', 'TREASURER'] },
  { name: 'Laporan', href: '/dashboard/reports', icon: FileText, roles: ['SUPER_ADMIN', 'TREASURER'] },
  { name: 'Kwitansi', href: '/dashboard/receipts', icon: Receipt, roles: ['SUPER_ADMIN', 'TREASURER'] },
  { name: 'Chart of Accounts', href: '/dashboard/coa', icon: BookOpen, roles: ['SUPER_ADMIN'] },
  { name: 'Manajemen User', href: '/dashboard/users', icon: Users, roles: ['SUPER_ADMIN'] },
  { name: 'Pengaturan Sekolah', href: '/dashboard/school-settings', icon: Building2, roles: ['SUPER_ADMIN'] },
  { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'TREASURER'] },
]

export function Sidebar({ isOpen, onClose, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Filter navigation berdasarkan role user
  const filteredNavigation = navigation.filter(item => {
    if (!session?.user?.role) return false
    return item.roles.includes(session.user.role)
  })

  // Always show sidebar structure even when loading
  if (status === 'loading') {
    return (
      <>
        {/* Mobile backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col transform transition-transform duration-200 ease-in-out",
          "-translate-x-full md:translate-x-0",
          isOpen && "translate-x-0",
          isCollapsed && "md:-translate-x-full"
        )}>
          <div className="flex flex-col flex-grow bg-slate-800 overflow-y-auto shadow-xl">
            {/* Header with close button for mobile */}
            <div className="flex items-center justify-between h-16 flex-shrink-0 px-5 bg-slate-900 border-b border-slate-700">
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
              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-60 flex-col transform transition-transform duration-200 ease-in-out",
        "-translate-x-full md:translate-x-0",
        isOpen && "translate-x-0",
        isCollapsed && "md:-translate-x-full"
      )}>
        <div className="flex flex-col flex-grow bg-slate-800 overflow-y-auto shadow-xl">
          {/* Header with close button for mobile */}
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-5 bg-slate-900 border-b border-slate-700">
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
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="mt-4 px-3 space-y-1">{filteredNavigation.map((item) => {
            const isDashboardRoot = item.href === '/dashboard'
            const isActive = isDashboardRoot
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()} // Close sidebar on mobile after navigation
                className={cn(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white hover:translate-x-1'
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
          })}</nav>
          
          {/* User Profile Footer */}
          <div className="p-3 border-t border-slate-700">
            <div className="flex items-center gap-3 px-2 py-2 bg-slate-900/50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session?.user?.role === 'SUPER_ADMIN' && '👑 Super Admin'}
                  {session?.user?.role === 'BENDAHARA' && '💰 Bendahara'}
                  {!['SUPER_ADMIN', 'BENDAHARA'].includes(session?.user?.role || '') && '👤 User'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}