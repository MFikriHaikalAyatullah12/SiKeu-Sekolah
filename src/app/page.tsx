import { redirect } from "next/navigation"

export default async function HomePage() {
  // Selalu redirect ke halaman login untuk menjaga keamanan
  redirect("/auth/signin")
}
