"use client"
import { useState } from "react"
import Link from "next/link"

const FEATURES = [
  { icon: "🏪", title: "Multi-Marketplace Sync", desc: "List once. Sell on Takealot, Amazon SA, Makro, Bob Shop simultaneously. Inventory synced in real-time." },
  { icon: "💲", title: "AI Dynamic Pricing", desc: "AI monitors competitor prices 24/7 and adjusts your prices to win the buy box while protecting margins." },
  { icon: "📦", title: "Smart Inventory Management", desc: "Never overstock or stock out. AI predicts demand and alerts you when to reorder, automatically." },
  { icon: "✍️", title: "AI Product Descriptions", desc: "Claude AI writes SEO-optimised product titles, descriptions, and bullet points that convert browsers into buyers." },
  { icon: "📊", title: "Profit Analytics", desc: "Real-time profit calculator per SKU after all marketplace fees, shipping, and COGS. Know your numbers instantly." },
  { icon: "🚚", title: "Order Automation", desc: "Auto-confirm orders, generate waybills, notify customers, and update tracking across all marketplaces." }
]

const PLANS = [
  { name: "Starter", price: 299, color: "#6366f1", skus: 50, marketplaces: 1, features: ["50 SKUs", "1 marketplace", "AI pricing", "Basic analytics", "Email support"] },
  { name: "Growth", price: 699, color: "#8b5cf6", popular: true, skus: 500, marketplaces: 3, features: ["500 SKUs", "3 marketplaces", "AI descriptions", "Profit analytics", "Demand forecasting", "Priority support"] },
  { name: "Pro", price: 1499, color: "#a855f7", skus: 0, marketplaces: 0, features: ["Unlimited SKUs", "All marketplaces", "Custom AI rules", "White-label reports", "API access", "Dedicated manager"] }
]

export default function SellBotLanding() {
  const [email, setEmail] = useState("")
  const [joined, setJoined] = useState(false)

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
    setJoined(true)
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white overflow-x-hidden">
      {/* Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,transparent_60%)] pointer-events-none" />

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="font-black text-xl">
          Sell<span className="text-indigo-400">Bot</span>
          <span className="text-indigo-400 ml-1 text-sm">AI</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm text-slate-400">
          {["Features", "Pricing", "Marketplaces"].map(l => <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>)}
        </div>
        <Link href="/dashboard" className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-indigo-500 transition-colors">
          Dashboard →
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative z-10 px-6 pt-16 pb-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 border border-indigo-500/30 text-indigo-300 text-xs px-4 py-2 rounded-full mb-8 bg-indigo-500/10">
          🤖 AI-POWERED E-COMMERCE FOR SOUTH AFRICA
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">
          Sell More.<br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Work Less.</span><br />
          Scale Faster.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          SellBot AI automates your entire e-commerce operation — from listing to fulfilment — across Takealot, Amazon SA, and Makro. Set up in 15 minutes.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
          {[{v:"3",l:"Marketplaces"},{v:"50+",l:"Hours Saved/Month"},{v:"AI",l:"Dynamic Pricing"},{v:"24/7",l:"Auto-Running"}].map((s,i)=>(
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-2xl font-black text-indigo-400">{s.v}</div>
              <div className="text-xs text-slate-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
        {joined ? (
          <div className="bg-indigo-900/30 border border-indigo-500/40 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-3xl mb-3">🎉</div>
            <h3 className="font-black text-xl text-indigo-300">You're on the list!</h3>
            <p className="text-slate-400 mt-2 text-sm">We'll email you when your account is ready. Expected: 48 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="Enter your email" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
            <button type="submit" className="bg-indigo-600 text-white font-black px-6 py-3 rounded-xl hover:bg-indigo-500 transition-colors whitespace-nowrap">
              Get Early Access →
            </button>
          </form>
        )}
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-12">Everything Automated</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/40 transition-all">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-black text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACES */}
      <section id="marketplaces" className="relative z-10 px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-black mb-4">Supported Marketplaces</h2>
        <p className="text-slate-400 mb-10">Connect once. Sell everywhere.</p>
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { name: "Takealot", emoji: "🛒", status: "Live" },
            { name: "Amazon SA", emoji: "📦", status: "Live" },
            { name: "Makro", emoji: "🏭", status: "Beta" },
            { name: "Bob Shop", emoji: "🛍️", status: "Coming Soon" },
            { name: "Loot", emoji: "💎", status: "Coming Soon" }
          ].map((m, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 text-center">
              <div className="text-3xl mb-2">{m.emoji}</div>
              <div className="font-bold text-sm">{m.name}</div>
              <div className={`text-xs mt-1 ${m.status === "Live" ? "text-green-400" : m.status === "Beta" ? "text-yellow-400" : "text-slate-500"}`}>
                {m.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <div key={i} className={`relative bg-slate-900 rounded-2xl p-8 border ${plan.popular ? "border-indigo-500/60 scale-105" : "border-slate-800"}`}>
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-full">MOST POPULAR</div>}
              <div className="text-xs tracking-widest mb-2" style={{ color: plan.color }}>{plan.name}</div>
              <div className="text-4xl font-black mb-4">R{plan.price}<span className="text-slate-500 text-sm">/mo</span></div>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block w-full text-center py-3 rounded-xl font-bold transition-colors"
                style={{ background: plan.popular ? "#6366f1" : "transparent", color: plan.popular ? "#fff" : plan.color, border: plan.popular ? "none" : `1px solid ${plan.color}55` }}>
                Start Free Trial →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-600">
        <div className="font-black text-white mb-2">Sell<span className="text-indigo-400">Bot</span> AI</div>
        <p>© 2026 SellBot AI. South Africa 🇿🇦</p>
      </footer>
    </div>
  )
}
