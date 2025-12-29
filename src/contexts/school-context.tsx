"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface SchoolProfile {
  id: string
  name: string
  address: string
  phone: string
  email: string
  logoUrl?: string | null
  createdAt: string
  updatedAt: string
}

interface SchoolContextType {
  school: SchoolProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateSchool: (data: Partial<SchoolProfile>) => Promise<boolean>
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined)

export function SchoolProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [school, setSchool] = useState<SchoolProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchoolProfile = async () => {
    if (!session) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/school-profile')
      const data = await response.json()

      if (response.ok) {
        setSchool(data.school)
      } else {
        setError(data.error || 'Gagal mengambil data sekolah')
        setSchool(null)
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data sekolah')
      setSchool(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSchool = async (updateData: Partial<SchoolProfile>): Promise<boolean> => {
    if (!session) return false
    
    try {
      const response = await fetch('/api/school-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        setSchool(data.school)
        return true
      } else {
        setError(data.error || 'Gagal memperbarui data sekolah')
        return false
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memperbarui data sekolah')
      return false
    }
  }

  const refetch = async () => {
    await fetchSchoolProfile()
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSchoolProfile()
    } else if (status === 'unauthenticated') {
      setSchool(null)
      setIsLoading(false)
    }
  }, [session, status])

  const contextValue: SchoolContextType = {
    school,
    isLoading,
    error,
    refetch,
    updateSchool
  }

  return (
    <SchoolContext.Provider value={contextValue}>
      {children}
    </SchoolContext.Provider>
  )
}

export function useSchool() {
  const context = useContext(SchoolContext)
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider')
  }
  return context
}

export default SchoolContext