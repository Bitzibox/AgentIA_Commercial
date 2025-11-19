import type { Metadata } from "next"
// Temporarily commented out due to network issues in build environment
// import { Inter } from "next/font/google"
import "./globals.css"

// const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agent Commercial IA - Copilote pour TPE/PME",
  description: "Votre assistant commercial intelligent pour booster vos ventes",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
