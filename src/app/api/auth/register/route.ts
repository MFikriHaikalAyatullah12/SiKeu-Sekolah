import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      password,
      schoolName,
      schoolAddress,
      schoolPhone,
      schoolEmail
    } = body

    // Validasi input
    if (!name || !email || !password || !schoolName || !schoolAddress || !schoolPhone || !schoolEmail) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      )
    }

    // Cek apakah email user sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    // Cek apakah email sekolah sudah terdaftar
    const existingSchool = await prisma.schoolProfile.findUnique({
      where: { email: schoolEmail }
    })

    if (existingSchool) {
      return NextResponse.json(
        { error: "Email sekolah sudah terdaftar" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat school profile terlebih dahulu
    const schoolProfile = await prisma.schoolProfile.create({
      data: {
        name: schoolName,
        address: schoolAddress,
        phone: schoolPhone,
        email: schoolEmail,
      }
    })

    // Buat user dengan role ADMIN dan hubungkan ke school profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN", // User pertama dari sekolah adalah admin
        schoolProfileId: schoolProfile.id,
      }
    })

    return NextResponse.json(
      { 
        message: "Pendaftaran berhasil",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 }
    )
  }
}
