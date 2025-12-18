import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { Transaction } from '@/types/transaction'
import { SchoolProfile } from '@/types/school'

export async function generateReceiptPDF(
  transaction: Transaction,
  schoolProfile: SchoolProfile
): Promise<Blob> {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height

  // Generate QR code
  const qrCodeData = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${transaction.receiptNumber}`
  const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
    width: 150,
    margin: 1,
  })

  // Header - School Logo and Info
  pdf.setFillColor(0, 102, 204) // Blue background
  pdf.rect(0, 0, pageWidth, 35, 'F')

  // School info (white text on blue background)
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text(schoolProfile.name, 20, 15)
  
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text(schoolProfile.address, 20, 22)
  pdf.text(`${schoolProfile.email} | ${schoolProfile.phone}`, 20, 29)

  // Ministry logo placeholder (if available)
  if (schoolProfile.logoUrl) {
    // Add school logo - you would need to implement image loading
    pdf.addImage(schoolProfile.logoUrl, 'PNG', pageWidth - 45, 5, 25, 25)
  }

  // Reset text color for body
  pdf.setTextColor(0, 0, 0)

  // Receipt title
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('KWITANSI PEMBAYARAN', pageWidth / 2, 55, { align: 'center' })

  // Receipt number and date
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text(`No. Kwitansi: ${transaction.receiptNumber}`, 20, 70)
  pdf.text(`Tanggal: ${new Date(transaction.date).toLocaleDateString('id-ID')}`, pageWidth - 20, 70, { align: 'right' })

  // Student/Payer information
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text('Telah Terima Dari:', 20, 90)
  
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Nama: ${transaction.fromTo}`, 20, 100)
  pdf.text(`Kelas: ${transaction.studentClass || '-'}`, 20, 110)

  // Payment details
  pdf.setFont('helvetica', 'bold')
  pdf.text('Untuk Pembayaran:', 20, 130)
  
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Kategori: ${transaction.category}`, 20, 140)
  pdf.text(`Keterangan: ${transaction.description}`, 20, 150)

  // Amount box
  pdf.setDrawColor(0, 102, 204)
  pdf.setLineWidth(1)
  pdf.rect(20, 165, pageWidth - 40, 25)
  
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text('Sejumlah Uang:', 25, 175)
  pdf.setFontSize(16)
  pdf.text(`Rp ${transaction.amount.toLocaleString('id-ID')}`, 25, 185)

  // Payment method and status
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text(`Metode Pembayaran: ${getPaymentMethodText(transaction.paymentMethod)}`, 20, 205)
  pdf.text(`Status: ${getStatusText(transaction.status)}`, 20, 215)

  // Terbilang (amount in words) - you would implement this function
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(10)
  const amountInWords = `Terbilang: ${numberToWords(transaction.amount)} rupiah`
  pdf.text(amountInWords, 20, 225, { maxWidth: pageWidth - 40 })

  // QR Code
  pdf.addImage(qrCodeDataURL, 'PNG', pageWidth - 45, 165, 25, 25)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.text('Verifikasi Keaslian', pageWidth - 45, 195, { align: 'center', maxWidth: 25 })

  // Signature section
  const signatureY = 245
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text('Bendahara Sekolah,', pageWidth - 80, signatureY)

  // Signature image placeholder
  if (schoolProfile.signatureUrl) {
    pdf.addImage(schoolProfile.signatureUrl, 'PNG', pageWidth - 80, signatureY + 5, 40, 15)
  }

  // Stamp placeholder
  if (schoolProfile.stampUrl) {
    pdf.addImage(schoolProfile.stampUrl, 'PNG', pageWidth - 100, signatureY + 10, 20, 20)
  }

  pdf.setFont('helvetica', 'normal')
  pdf.text('(Signature Placeholder)', pageWidth - 80, signatureY + 25)
  pdf.text('(Stamp Placeholder)', pageWidth - 80, signatureY + 35)

  // Footer
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(8)
  pdf.text('© 2024 SiKeu Sekolah. Hak Cipta Dilindungi.', pageWidth / 2, pageHeight - 10, { align: 'center' })

  return pdf.output('blob')
}

function getPaymentMethodText(method: string): string {
  switch (method) {
    case 'CASH':
      return 'Tunai'
    case 'BANK_TRANSFER':
      return 'Transfer Bank'
    case 'QRIS':
      return 'QRIS'
    default:
      return method
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'PAID':
      return 'Lunas'
    case 'PENDING':
      return 'Menunggu'
    case 'VOID':
      return 'Void'
    default:
      return status
  }
}

function numberToWords(num: number): string {
  // This is a simplified version - you would implement a complete Indonesian number to words converter
  if (num === 0) return 'nol'
  
  const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan']
  const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas']
  const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh']
  
  if (num < 10) return ones[num]
  if (num >= 10 && num < 20) return teens[num - 10]
  if (num >= 20 && num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '')
  }
  if (num >= 100 && num < 1000) {
    return (num >= 200 ? ones[Math.floor(num / 100)] + ' ratus' : 'seratus') + 
           (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '')
  }
  if (num >= 1000 && num < 1000000) {
    return (num >= 2000 ? numberToWords(Math.floor(num / 1000)) + ' ribu' : 'seribu') + 
           (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '')
  }
  if (num >= 1000000) {
    return numberToWords(Math.floor(num / 1000000)) + ' juta' + 
           (num % 1000000 !== 0 ? ' ' + numberToWords(num % 1000000) : '')
  }
  
  return num.toString()
}