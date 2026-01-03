'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" suppressHydrationWarning>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />
      <div className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? "" : "md:ml-60"}`} suppressHydrationWarning>
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="w-full overflow-x-hidden">
          <div className="p-2 sm:p-4 md:p-6 w-full">
            <div className="max-w-full mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}