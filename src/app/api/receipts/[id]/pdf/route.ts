import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import jsPDF from "jspdf"

// Initialize font for Indonesian text (support UTF-8)
declare global {
  interface Window {
    jsPDF: any;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const transactionId = id

    // Get transaction data
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        schoolProfile: true,
        category: true,
        coaAccount: {
          include: {
            subCategory: {
              include: {
                category: true
              }
            }
          }
        },
        createdBy: true
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Check if school profile exists
    if (!transaction.schoolProfile) {
      return NextResponse.json(
        { error: "School profile not found for this transaction" },
        { status: 404 }
      )
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm", 
      format: "a4"
    })

    // School header
    const schoolName = transaction.schoolProfile?.name || "SEKOLAH"
    const schoolAddress = transaction.schoolProfile?.address || "Alamat Sekolah"
    const logoUrl = transaction.schoolProfile?.logoUrl
    
    // Add logo if available
    let textStartX = 25 // Default start position without logo
    
    if (logoUrl) {
      try {
        // Fetch logo and convert to base64
        const logoResponse = await fetch(logoUrl)
        const logoBlob = await logoResponse.blob()
        const logoArrayBuffer = await logoBlob.arrayBuffer()
        const logoBase64 = Buffer.from(logoArrayBuffer).toString('base64')
        const logoMimeType = logoBlob.type || 'image/png'
        const logoDataUrl = `data:${logoMimeType};base64,${logoBase64}`
        
        // Add logo to PDF (left side)
        const logoSize = 18
        doc.addImage(logoDataUrl, 'PNG', 20, 12, logoSize, logoSize)
        textStartX = 42 // Move text right to accommodate logo
      } catch (logoError) {
        console.warn('Failed to add logo to PDF:', logoError)
        // Continue without logo
      }
    }
    
    // Professional header design with better layout
    // School name - left aligned after logo
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text(schoolName.toUpperCase(), textStartX, 18)
    
    // School address - left aligned, smaller font
    doc.setFontSize(9)
    doc.text(schoolAddress, textStartX, 25)
    
    // Additional contact info if available
    let contactY = 30
    if (transaction.schoolProfile?.phone) {
      doc.text(`Telp: ${transaction.schoolProfile.phone}`, textStartX, contactY)
      contactY += 4
    }
    if (transaction.schoolProfile?.email) {
      doc.text(`Email: ${transaction.schoolProfile.email}`, textStartX, contactY)
    }
    
    // Professional header separator - solid line instead of dots
    doc.setLineWidth(1)
    doc.setDrawColor(0, 0, 0)
    doc.line(20, 50, 190, 50)  // Top line
    doc.setLineWidth(0.3)
    doc.line(20, 52, 190, 52)  // Bottom line
    
    // Title "BUKTI PEMBAYARAN" with professional styling
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text("BUKTI PEMBAYARAN", 105, 65, { align: "center" })
    
    // Underline for title
    doc.setLineWidth(0.5)
    doc.line(75, 67, 135, 67)
    
    // Receipt details with professional alignment
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    // Use current server time (real-time when download)
    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
    const formattedTime = currentDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    // Receipt info - Left column
    doc.text(`No Transaksi`, 25, 80)
    doc.text(`: ${transaction.receiptNumber || transactionId.slice(-10)}`, 65, 80)
    
    doc.text(`No Induk`, 25, 88)
    doc.text(`: ${transactionId.slice(-6)}`, 65, 88)
    
    doc.text(`Nama`, 25, 96)
    doc.text(`: ${transaction.fromTo}`, 65, 96)
    
    // Receipt info - Right column
    doc.text(`Tanggal`, 125, 80)
    doc.text(`: ${formattedDate} ${formattedTime}`, 155, 80)
    
    doc.text(`Pekas`, 125, 88)  
    doc.text(`: ${transaction.createdBy?.name || 'Admin'}`, 155, 88)
    
    // Professional separator line
    doc.setLineWidth(0.5)
    doc.setDrawColor(0, 0, 0)
    doc.line(20, 105, 190, 105)
    
    // Transaction items table with professional styling
    doc.setLineWidth(0.8)
    doc.setDrawColor(0, 0, 0)
    
    // Table headers with professional styling
    doc.setFillColor(240, 240, 240)  // Light gray background
    doc.rect(25, 115, 15, 10, 'FD')  // No column
    doc.rect(40, 115, 85, 10, 'FD')  // Nama Pembayaran column  
    doc.rect(125, 115, 40, 10, 'FD') // Nominal column
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("No", 32, 122, { align: "center" })
    doc.text("Nama Pembayaran", 82, 122, { align: "center" })
    doc.text("Nominal", 145, 122, { align: "center" })
    
    // Payment items with professional borders
    let yStart = 125
    const itemHeight = 10
    
    doc.setFillColor(255, 255, 255)  // White background
    doc.rect(25, yStart, 15, itemHeight, 'FD')
    doc.rect(40, yStart, 85, itemHeight, 'FD') 
    doc.rect(125, yStart, 40, itemHeight, 'FD')
    
    doc.setFontSize(10)
    doc.text("1", 32, yStart + 6, { align: "center" })
    
    // Payment description - better formatting
    let paymentDesc = transaction.description
    if (transaction.coaAccount) {
      paymentDesc = `${transaction.coaAccount.name}`
    }
    
    // Wrap text if too long
    const maxWidth = 80
    if (paymentDesc.length > 50) {
      const lines = doc.splitTextToSize(paymentDesc, maxWidth)
      doc.text(lines[0], 42, yStart + 6)
      if (lines[1]) {
        doc.text(lines[1], 42, yStart + 10)
        yStart += 4  // Add extra space for wrapped text
      }
    } else {
      doc.text(paymentDesc, 42, yStart + 6)
    }
    
    // Amount formatting with better alignment
    const amount = Number(transaction.amount)
    const formattedAmount = new Intl.NumberFormat('id-ID').format(amount)
    doc.text(formattedAmount, 163, yStart + 6, { align: "right" })
    
    let currentY = yStart + itemHeight
    
    // Professional dotted line before total
    for (let x = 20; x < 190; x += 2) {
      doc.circle(x, currentY + 5, 0.3, 'F')
    }
    
    // Total section with professional styling
    doc.setFillColor(250, 250, 250)  // Very light gray
    doc.rect(100, currentY + 10, 65, 15, 'FD')
    
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text("Total :", 105, currentY + 18)
    doc.text(formattedAmount, 160, currentY + 18, { align: "right" })
    
    doc.text("Terbayar :", 105, currentY + 23)  
    doc.text(formattedAmount, 160, currentY + 23, { align: "right" })
    
    // Professional dotted line before terbilang
    for (let x = 20; x < 190; x += 2) {
      doc.circle(x, currentY + 32, 0.3, 'F')
    }
    
    // Convert number to text (terbilang) - properly formatted
    const terbilang = convertToWords(amount)
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Terbilang : ${terbilang.charAt(0).toUpperCase() + terbilang.slice(1)} Rupiah`, 25, currentY + 42)
    
    // Professional dotted line after terbilang
    for (let x = 20; x < 190; x += 2) {
      doc.circle(x, currentY + 50, 0.3, 'F')
    }
    
    // Footer section with professional layout
    doc.setFontSize(10)
    doc.text(`Indonesia, ${formattedDate}`, 125, currentY + 65)
    doc.text(`Petugas`, 135, currentY + 75)
    
    // Professional signature box
    doc.setLineWidth(0.5)
    doc.rect(115, currentY + 80, 50, 25)
    doc.setFontSize(8)
    doc.text("Tanda Tangan & Stempel", 140, currentY + 78, { align: "center" })
    
    // Name below signature
    doc.setFontSize(10)
    doc.text(transaction.createdBy?.name || "Admin", 140, currentY + 110, { align: "center" })
    
    // Generate PDF as buffer
    const pdfBuffer = doc.output("arraybuffer")
    
    // Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Kwitansi-${transaction.receiptNumber || transactionId.slice(-8)}.pdf"`
      }
    })

  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}

// Helper function to convert number to Indonesian words (terbilang)
function convertToWords(num: number): string {
  const ones = [
    "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan",
    "sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas",
    "enam belas", "tujuh belas", "delapan belas", "sembilan belas"
  ]
  
  const tens = [
    "", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh", 
    "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"
  ]
  
  if (num === 0) return "nol"
  if (num < 20) return ones[num]
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "")
  if (num < 1000) return ones[Math.floor(num / 100)] + " ratus" + (num % 100 !== 0 ? " " + convertToWords(num % 100) : "")
  if (num < 1000000) return convertToWords(Math.floor(num / 1000)) + " ribu" + (num % 1000 !== 0 ? " " + convertToWords(num % 1000) : "")
  if (num < 1000000000) return convertToWords(Math.floor(num / 1000000)) + " juta" + (num % 1000000 !== 0 ? " " + convertToWords(num % 1000000) : "")
  
  return convertToWords(Math.floor(num / 1000000000)) + " milyar" + (num % 1000000000 !== 0 ? " " + convertToWords(num % 1000000000) : "")
}