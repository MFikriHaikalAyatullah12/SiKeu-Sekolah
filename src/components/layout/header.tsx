'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Settings, User, Search, ChevronDown, Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
  isMobile?: boolean
}

export function Header({ onMenuClick, onToggleSidebar, sidebarCollapsed, isMobile }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // Langsung navigate ke login sambil clear session
      router.push('/auth/signin')
      
      // SignOut tanpa redirect untuk menghindari tampilan blank
      await signOut({ redirect: false })
      
      // Clear storage
      localStorage.clear()
      sessionStorage.clear()
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: langsung ke login page
      window.location.href = '/auth/signin'
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20 w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 gap-2 sm:gap-3 lg:gap-4">
        {/* Toggle button - visible on all screen sizes */}
        <button
          onClick={isMobile ? onMenuClick : onToggleSidebar}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
          aria-label={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
          suppressHydrationWarning
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar - Responsive visibility */}
        <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder={isMobile ? "Cari..." : "Cari transaksi atau siswa..."} 
              className="pl-9 sm:pl-10 bg-gray-50 border-gray-200 focus:bg-white w-full text-sm h-9 sm:h-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 hover:bg-gray-100 rounded-lg px-1.5 sm:px-2 lg:px-3 h-9 sm:h-10">
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs sm:text-sm">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs sm:text-sm font-medium text-gray-700 hidden lg:block max-w-[120px] truncate">
                  {session?.user?.name || 'Bendahara'}
                </span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs leading-none text-blue-600 font-semibold mt-1">
                    {session?.user?.role === 'SUPER_ADMIN' && '👑 Super Admin'}
                    {session?.user?.role === 'ADMIN' && '🔑 Admin'}
                    {session?.user?.role === 'TREASURER' && '💰 Bendahara'}
                    {session?.user?.role === 'USER' && '👤 User'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}