export interface SchoolProfile {
  id: string
  name: string
  address: string
  phone: string
  email: string
  logoUrl?: string
  signatureUrl?: string
  stampUrl?: string
  receiptFormat: string
  receiptCounter: number
  receiptResetType: "MONTHLY" | "YEARLY"
  createdAt: string
  updatedAt: string
}

export interface SchoolSettings {
  receiptNumberFormat: string
  receiptResetCounter: "MONTHLY" | "YEARLY"
  enableQrVerification: boolean
  autoGenerateReceipt: boolean
  defaultCategories: {
    income: string[]
    expense: string[]
  }
}