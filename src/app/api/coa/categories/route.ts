import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get COA categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const where: any = { isActive: true }
    
    if (type) {
      where.type = type
    }

    // Get COA categories
    const categories = await prisma.coaCategory.findMany({
      where,
      orderBy: { code: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching COA categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
