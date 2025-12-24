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
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, schoolId } = body

    const targetSchoolId = schoolId || session.user.schoolId

    if (!targetSchoolId) {
      return NextResponse.json({ 
        error: "School ID required" 
      }, { status: 400 })
    }

    // Check if category already exists
    const existing = await prisma.category.findFirst({
      where: {
        name,
        schoolProfileId: targetSchoolId,
      }
    })

    if (existing) {
      return NextResponse.json({ category: existing })
    }

    // Create new category
    const category = await prisma.category.create({
      data: {
        name,
        type: type || "INCOME",
        schoolProfileId: targetSchoolId,
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}