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
import { Bell, LogOut, Settings, User, Search, ChevronDown, Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

export function Header({ onMenuClick, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
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
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 gap-2 sm:gap-4">
        {/* Desktop toggle button */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:block p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          suppressHydrationWarning
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          suppressHydrationWarning
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar - Hidden on small mobile */}
        <div className="hidden sm:flex flex-1 max-w-xl ml-4 md:ml-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Cari transaksi atau siswa..." 
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white w-full text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-full p-2 sm:p-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 hover:bg-gray-100 rounded-lg px-2 sm:px-3">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs sm:text-sm font-medium text-gray-700 hidden md:block">
                  {session?.user?.name || 'Bendahara'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
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