"use client"
import { useState } from "react"

const PRODUCTS = [
  { name: "Instant Mpesu Mageu 1kg", sku: "MAG-001", takealot: 89, amazon: 95, stock: 234, sales30d: 87, profit: 28.50 },
  { name: "Instant Mpesu Mageu 500g", sku: "MAG-002", takealot: 52, amazon: 58, stock: 156, sales30d: 64, profit: 16.20 },
  { name: "Kitchen Scale Digital 5kg", sku: "KIT-001", takealot: 299, amazon: 319, stock: 42, sales30d: 23, profit: 89.00 },
  { name: "Silicone Baking Mat Set", sku: "KIT-002", takealot: 149, amazon: 159, stock: 78, sales30d: 31, profit: 44.50 }
]

export default function SellBotDashboard() {
  const [tab, setTab] = useState("products")
  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex">
      <aside className="w-56 border-r border-slate-800 p-5 flex flex-col gap-1 fixed h-full">
        <div className="font-black text-lg mb-8">Sell<span className="text-indigo-400">Bot</span> AI</div>
        {[["products","📦","Products"],["orders","🚚","Orders"],["analytics","📊","Analytics"],["pricing","💲","Pricing Rules"],["settings","⚙️","Settings"]].map(([id,icon,label])=>(
          <button key={id} onClick={() => setTab(id as string)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${tab === id ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30" : "text-slate-500 hover:text-slate-300"}`}>
            {icon} {label}
          </button>
        ))}
      </aside>
      <main className="ml-56 flex-1 p-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[{l:"Total Revenue",v:"R24,680",c:"text-green-400"},{l:"Orders Today",v:"14",c:"text-indigo-400"},{l:"Active SKUs",v:"47",c:"text-yellow-400"},{l:"Avg Margin",v:"31%",c:"text-purple-400"}].map((s,i)=>(
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest">{s.l}</div>
              <div className={`text-3xl font-black ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-black">Products</h2>
            <button className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors">+ Add Product</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-slate-500 border-b border-slate-800">
              {["Product","SKU","Takealot","Amazon SA","Stock","30d Sales","Margin"].map(h=>(
                <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {PRODUCTS.map((p,i)=>(
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-medium">{p.name}</td>
                  <td className="px-5 py-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-5 py-4 text-green-400">R{p.takealot}</td>
                  <td className="px-5 py-4 text-indigo-400">R{p.amazon}</td>
                  <td className="px-5 py-4">{p.stock}</td>
                  <td className="px-5 py-4">{p.sales30d}</td>
                  <td className="px-5 py-4 text-yellow-400">R{p.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
