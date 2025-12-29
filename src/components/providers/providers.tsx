"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "next-themes"
import { SessionGuard } from "@/components/security/session-guard"
import { SchoolProvider } from "@/contexts/school-context"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    })
  )

  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session setiap 5 menit
      refetchOnWindowFocus={true} // Refetch saat window fokus
    >
      <SessionGuard>
        <SchoolProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="light" 
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </ThemeProvider>
          </QueryClientProvider>
        </SchoolProvider>
      </SessionGuard>
    </SessionProvider>
  )
}