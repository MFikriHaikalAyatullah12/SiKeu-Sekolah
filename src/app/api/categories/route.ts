import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get schoolId from query params or session
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get("schoolId") || session.user.schoolId

    // Super Admin tidak punya schoolId, jadi perlu handle khusus
    if (!schoolId) {
      return NextResponse.json({ 
        categories: [],
        message: "Pilih sekolah terlebih dahulu" 
      })
    }

    const categories = await prisma.category.findMany({
      where: {
        schoolProfileId: schoolId,
        isActive: true
      },
      orderBy: {
        name: "asc"
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
