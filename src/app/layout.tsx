import type { Metadata } from "next"
import "./globals.css"
export const metadata: Metadata = {
  title: "SellBot AI — Automate Your SA E-commerce Business",
  description: "AI-powered e-commerce automation for Takealot, Amazon SA, and Makro. Auto-list, auto-price, auto-fulfil."
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
