"use client"

import { useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SessionGuardProps {
  children: React.ReactNode
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Cek apakah ada session yang tersimpan di localStorage dari browser sebelumnya
    const handleBeforeUnload = () => {
      // Hapus semua data session saat browser ditutup
      localStorage.clear()
      sessionStorage.clear()
    }

    // Tambahkan event listener untuk browser close
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cek session timeout setiap 1 menit
    const sessionInterval = setInterval(() => {
      if (session) {
        // Cek apakah session masih valid berdasarkan waktu
        const sessionTime = new Date(session.expires).getTime()
        const currentTime = new Date().getTime()
        
        if (currentTime >= sessionTime) {
          // Langsung navigate ke login tanpa menunggu signOut selesai
          router.push('/auth/signin')
          signOut({ redirect: false })
          localStorage.clear()
          sessionStorage.clear()
        }
      }
    }, 60000) // Cek setiap 1 menit

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(sessionInterval)
    }
  }, [session, router])

  return <>{children}</>
}