"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { createBrowserSupabase } from "@/lib/supabase-browser"

type Product = { id: string; name: string; sku: string }
type PricingRule = {
  id: string; product_id: string; marketplace: string; rule_type: string;
  min_price: number | null; max_price: number | null; target_margin_pct: number;
  is_active: boolean; created_at: string;
  products: { name: string; sku: string } | null;
}

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editRule, setEditRule] = useState<PricingRule | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    product_id: "", marketplace: "takealot", rule_type: "margin",
    min_price: "", max_price: "", target_margin_pct: "30", is_active: true
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [rulesRes, prodsRes] = await Promise.all([
        fetch("/api/pricing-rules"),
        fetch("/api/products")
      ])
      const rulesData = await rulesRes.json()
      const prodsData = await prodsRes.json()
      if (rulesData.rules) setRules(rulesData.rules)
      if (prodsData.products) setProducts(prodsData.products)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setFormData({ product_id: "", marketplace: "takealot", rule_type: "margin", min_price: "", max_price: "", target_margin_pct: "30", is_active: true })
    setEditRule(null)
  }

  const openEdit = (r: PricingRule) => {
    setEditRule(r)
    setFormData({
      product_id: r.product_id, marketplace: r.marketplace, rule_type: r.rule_type,
      min_price: r.min_price ? String(r.min_price) : "", max_price: r.max_price ? String(r.max_price) : "",
      target_margin_pct: String(r.target_margin_pct), is_active: r.is_active
    })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload: any = {
      product_id: formData.product_id, marketplace: formData.marketplace, rule_type: formData.rule_type,
      min_price: formData.min_price ? parseFloat(formData.min_price) : null,
      max_price: formData.max_price ? parseFloat(formData.max_price) : null,
      target_margin_pct: parseFloat(formData.target_margin_pct) || 30,
      is_active: formData.is_active,
    }
    if (editRule) payload.id = editRule.id
    const res = await fetch("/api/pricing-rules", {
      method: editRule ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (res.ok) { setShowForm(false); resetForm(); fetchData() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pricing rule?")) return
    await fetch("/api/pricing-rules", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    fetchData()
  }

  const toggleActive = async (rule: PricingRule) => {
    await fetch("/api/pricing-rules", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rule.id, is_active: !rule.is_active })
    })
    fetchData()
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex">
      <aside className="w-56 border-r border-slate-800 p-5 flex flex-col gap-1 fixed h-full">
        <Link href="/dashboard" className="font-black text-lg mb-8 block">Sell<span className="text-indigo-400">Bot</span> AI</Link>
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300">Products</Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">Pricing Rules</div>
        <Link href="/import" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300">CSV Import</Link>
      </aside>
      <main className="ml-56 flex-1 p-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-black">Pricing Rules</h2>
            <button onClick={() => { resetForm(); setShowForm(true) }}
              className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors">
              + Add Rule
            </button>
          </div>
          {loading ? (
            <div className="p-10 text-center text-slate-500">Loading...</div>
          ) : rules.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No pricing rules yet. Create one to automate your pricing.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-slate-500 border-b border-slate-800">
                {["Product", "Marketplace", "Rule Type", "Min Price", "Max Price", "Target Margin", "Active", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-medium">{r.products?.name || "-"}<span className="text-slate-500 text-xs ml-2">{r.products?.sku}</span></td>
                    <td className="px-5 py-4 capitalize">{r.marketplace}</td>
                    <td className="px-5 py-4 capitalize">{r.rule_type}</td>
                    <td className="px-5 py-4">{r.min_price ? `R${r.min_price}` : "-"}</td>
                    <td className="px-5 py-4">{r.max_price ? `R${r.max_price}` : "-"}</td>
                    <td className="px-5 py-4 text-indigo-400">{r.target_margin_pct}%</td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleActive(r)}
                        className={`text-xs px-2 py-1 rounded-full ${r.is_active ? "bg-green-900/40 text-green-400" : "bg-slate-800 text-slate-500"}`}>
                        {r.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4 flex gap-2">
                      <button onClick={() => openEdit(r)} className="text-indigo-400 hover:text-indigo-300 text-xs">Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h2 className="font-black text-xl mb-6">{editRule ? "Edit Pricing Rule" : "Add Pricing Rule"}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Product *</label>
                  <select value={formData.product_id} onChange={e => setFormData(p => ({ ...p, product_id: e.target.value }))} required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm">
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Marketplace *</label>
                    <select value={formData.marketplace} onChange={e => setFormData(p => ({ ...p, marketplace: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm">
                      <option value="takealot">Takealot</option>
                      <option value="amazon">Amazon SA</option>
                      <option value="makro">Makro</option>
                      <option value="bobshop">Bob Shop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Rule Type</label>
                    <select value={formData.rule_type} onChange={e => setFormData(p => ({ ...p, rule_type: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm">
                      <option value="margin">Margin</option>
                      <option value="competitor">Competitor</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Min Price (R)</label>
                    <input type="number" step="0.01" value={formData.min_price} onChange={e => setFormData(p => ({ ...p, min_price: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Max Price (R)</label>
                    <input type="number" step="0.01" value={formData.max_price} onChange={e => setFormData(p => ({ ...p, max_price: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Target Margin %</label>
                    <input type="number" step="0.01" value={formData.target_margin_pct} onChange={e => setFormData(p => ({ ...p, target_margin_pct: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                    className="rounded border-slate-700" />
                  Active
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 text-sm">
                    {saving ? "Saving..." : editRule ? "Update Rule" : "Create Rule"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); resetForm() }}
                    className="bg-slate-800 text-slate-400 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-700 transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
