import type { Metadata } from "next"
import "./globals.css"
export const metadata: Metadata = {
  title: "SellBot AI — Automate Your Takealot & E-commerce Business",
  description: "AI-powered product listing, pricing, and inventory management for Takealot, Amazon SA, and Makro sellers."
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
