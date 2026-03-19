"use client"
import Link from "next/link"

const FEATURES = [
  { icon: "🤖", title: "AI Listing Generator", desc: "Generate SEO-optimized product titles, descriptions, and keywords for Takealot, Amazon SA, and Makro in seconds" },
  { icon: "💰", title: "Smart Price Optimizer", desc: "Monitor competitor prices and automatically suggest optimal pricing to maximize sales and profit margins" },
  { icon: "📦", title: "Inventory Tracker", desc: "Track stock across multiple platforms in one dashboard. Get alerts before you run out" },
  { icon: "📊", title: "Sales Analytics", desc: "Unified dashboard for sales data across all your marketplaces. Know what's selling and what's not" },
  { icon: "⚡", title: "Bulk Product Upload", desc: "Upload hundreds of products at once with AI-generated content. What used to take days now takes minutes" },
  { icon: "🔍", title: "Competitor Intelligence", desc: "Monitor what your top competitors are selling, pricing, and promoting. Stay ahead automatically" }
]

export default function SellBotHome() {
  return (
    <div className="min-h-screen bg-[#040810] grid-bg">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-[#1a1a1a]">
        <div className="font-black text-xl">🛒 Sell<span className="text-[#10B981]">Bot</span> <span className="text-gray-500 text-sm font-normal">AI</span></div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white">Login</Link>
          <Link href="/signup" className="bg-[#10B981] text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-green-400">Start Free →</Link>
        </div>
      </nav>
      <section className="text-center px-6 py-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#10B98111] border border-[#10B98133] text-[#10B981] text-xs px-4 py-2 rounded-full mb-8 tracking-widest">🛒 TAKEALOT · AMAZON SA · MAKRO · FULLY AUTOMATED</div>
        <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">Sell More.<br/><span className="text-[#10B981]">Work Less.</span></h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">SellBot AI automates your entire e-commerce operation. AI-generated listings, smart pricing, inventory management, and competitor tracking — all in one place.</p>
        <Link href="/signup" className="inline-block bg-[#10B981] text-black font-black px-8 py-4 rounded-xl text-lg hover:bg-green-400 transition-all hover:scale-105">
          Start Selling Smarter →
        </Link>
      </section>
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f,i) => (
            <div key={i} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6 hover:border-[#10B98133] transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-bold mb-2">{f.title}</div>
              <div className="text-sm text-gray-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black">Pricing</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name:"Starter", price:299, features:["1 marketplace","50 AI listings/mo","Basic analytics","Email support"], color:"#00E5FF" },
            { name:"Pro", price:699, features:["3 marketplaces","Unlimited listings","Price optimizer","Competitor tracking","WhatsApp alerts"], color:"#10B981", popular:true },
            { name:"Business", price:1499, features:["All marketplaces","Bulk upload (1000+)","Full automation","API access","Priority support"], color:"#FFD700" }
          ].map((p,i) => (
            <div key={i} className={`bg-[#0d0d0d] rounded-2xl p-8 border relative ${(p as any).popular?"border-[#10B98166] scale-105":"border-[#1a1a1a]"}`}>
              {(p as any).popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-black text-xs font-black px-4 py-1.5 rounded-full">POPULAR</div>}
              <div className="text-xs mb-2" style={{color:p.color}}>{p.name.toUpperCase()}</div>
              <div className="text-4xl font-black mb-4">R{p.price}<span className="text-gray-500 text-lg">/mo</span></div>
              <ul className="space-y-2 mb-8">{p.features.map((f,j) => <li key={j} className="flex items-center gap-2 text-sm text-gray-300"><span style={{color:p.color}}>✓</span>{f}</li>)}</ul>
              <Link href="/signup" className="block w-full text-center py-3 rounded-xl font-bold"
                style={{background:(p as any).popular?"#10B981":"transparent",color:(p as any).popular?"black":p.color,border:(p as any).popular?"none":`1px solid ${p.color}55`}}>
                Get Started →
              </Link>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-[#1a1a1a] px-6 py-8 text-center text-sm text-gray-600">
        <div className="font-black text-white mb-2">🛒 SellBot AI</div>
        <p>© 2026 SellBot AI · Built for SA Sellers</p>
      </footer>
    </div>
  )
}
