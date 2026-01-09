"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { SessionGuard } from "@/components/security/session-guard"
import { SchoolProvider } from "@/contexts/school-context"
import { useState, lazy, Suspense } from "react"

// Lazy load ReactQueryDevtools only in development
const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
);

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
              {process.env.NODE_ENV === "development" && (
                <Suspense fallback={null}>
                  <ReactQueryDevtools initialIsOpen={false} />
                </Suspense>
              )}
            </ThemeProvider>
          </QueryClientProvider>
        </SchoolProvider>
      </SessionGuard>
    </SessionProvider>
  )
}