"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserSupabase } from "@/lib/supabase-browser"

type Product = {
  id: string; name: string; sku: string; cost_price: number;
  takealot_price: number | null; amazon_price: number | null; makro_price: number | null;
  stock_quantity: number; min_stock_alert: number;
  ai_description: string | null; ai_title: string | null;
  status: string; created_at: string; updated_at: string;
}

type Order = {
  id: string; order_number: string; marketplace: string; customer_name: string;
  quantity: number; sale_price: number; profit: number; status: string; created_at: string;
}

export default function SellBotDashboard() {
  const [tab, setTab] = useState("products")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "", sku: "", cost_price: "", takealot_price: "", amazon_price: "",
    makro_price: "", stock_quantity: "", min_stock_alert: "10", ai_description: "", ai_title: "", status: "active"
  })
  const [aiLoading, setAiLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createBrowserSupabase()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch("/api/products"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50)
      ])
      const prodData = await prodRes.json()
      if (prodData.products) setProducts(prodData.products)
      if (ordRes.data) setOrders(ordRes.data as Order[])
    } catch {}
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.sale_price || 0) * (o.quantity || 1), 0)
  const totalProfit = orders.reduce((sum, o) => sum + Number(o.profit || 0), 0)
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length

  const resetForm = () => {
    setFormData({ name: "", sku: "", cost_price: "", takealot_price: "", amazon_price: "", makro_price: "", stock_quantity: "", min_stock_alert: "10", ai_description: "", ai_title: "", status: "active" })
    setEditProduct(null)
  }

  const openEdit = (p: Product) => {
    setEditProduct(p)
    setFormData({
      name: p.name, sku: p.sku, cost_price: String(p.cost_price || ""),
      takealot_price: String(p.takealot_price || ""), amazon_price: String(p.amazon_price || ""),
      makro_price: String(p.makro_price || ""), stock_quantity: String(p.stock_quantity || ""),
      min_stock_alert: String(p.min_stock_alert || "10"), ai_description: p.ai_description || "",
      ai_title: p.ai_title || "", status: p.status || "active"
    })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload: any = {
      name: formData.name, sku: formData.sku,
      cost_price: parseFloat(formData.cost_price) || 0,
      takealot_price: formData.takealot_price ? parseFloat(formData.takealot_price) : null,
      amazon_price: formData.amazon_price ? parseFloat(formData.amazon_price) : null,
      makro_price: formData.makro_price ? parseFloat(formData.makro_price) : null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      min_stock_alert: parseInt(formData.min_stock_alert) || 10,
      ai_description: formData.ai_description || null,
      ai_title: formData.ai_title || null,
      status: formData.status,
    }
    if (editProduct) payload.id = editProduct.id

    const res = await fetch("/api/products", {
      method: editProduct ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      setShowForm(false)
      resetForm()
      fetchData()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
    fetchData()
  }

  const generateAIDescription = async () => {
    if (!formData.name) return
    setAiLoading(true)
    try {
      const res = await fetch("/api/products/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.name,
          category: "General",
          keyFeatures: formData.ai_description || formData.name,
          marketplace: "Takealot"
        })
      })
      const data = await res.json()
      if (data.listing) {
        setFormData(prev => ({
          ...prev,
          ai_title: data.listing.title || prev.ai_title,
          ai_description: data.listing.long_description || data.listing.short_description || prev.ai_description,
        }))
      }
    } catch {}
    setAiLoading(false)
  }

  const statusColor = (s: string) => {
    if (s === "delivered") return "text-green-400"
    if (s === "shipped") return "text-blue-400"
    if (s === "confirmed") return "text-yellow-400"
    if (s === "cancelled") return "text-red-400"
    return "text-slate-400"
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex">
      <aside className="w-56 border-r border-slate-800 p-5 flex flex-col gap-1 fixed h-full">
        <div className="font-black text-lg mb-8">Sell<span className="text-indigo-400">Bot</span> AI</div>
        {[
          ["products","products","Products"],
          ["orders","orders","Orders"],
          ["analytics","analytics","Analytics"],
          ["pricing","pricing","Pricing Rules"],
          ["import","import","CSV Import"],
          ["settings","settings","Settings"]
        ].map(([id, , label]) => {
          const icons: Record<string, string> = { products: "\u{1F4E6}", orders: "\u{1F69A}", analytics: "\u{1F4CA}", pricing: "\u{1F4B2}", import: "\u{1F4C1}", settings: "\u2699\uFE0F" }
          if (id === "pricing") {
            return (
              <Link key={id} href="/pricing"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left text-slate-500 hover:text-slate-300">
                {icons[id]} {label}
              </Link>
            )
          }
          if (id === "import") {
            return (
              <Link key={id} href="/import"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left text-slate-500 hover:text-slate-300">
                {icons[id]} {label}
              </Link>
            )
          }
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${tab === id ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30" : "text-slate-500 hover:text-slate-300"}`}>
              {icons[id]} {label}
            </button>
          )
        })}
        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-400 transition-all text-left w-full">
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { l: "Total Revenue", v: `R${totalRevenue.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`, c: "text-green-400" },
            { l: "Orders Today", v: String(todayOrders), c: "text-indigo-400" },
            { l: "Active SKUs", v: String(products.filter(p => p.status === "active").length), c: "text-yellow-400" },
            { l: "Total Profit", v: `R${totalProfit.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`, c: "text-purple-400" }
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest">{s.l}</div>
              <div className={`text-3xl font-black ${s.c}`}>{loading ? "..." : s.v}</div>
            </div>
          ))}
        </div>

        {/* Products Tab */}
        {tab === "products" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-black">Products</h2>
              <button onClick={() => { resetForm(); setShowForm(true) }}
                className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors">
                + Add Product
              </button>
            </div>
            {loading ? (
              <div className="p-10 text-center text-slate-500">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No products yet. Add your first product to get started.</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-slate-500 border-b border-slate-800">
                  {["Product", "SKU", "Takealot", "Amazon SA", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 font-medium">{p.name}</td>
                      <td className="px-5 py-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                      <td className="px-5 py-4 text-green-400">{p.takealot_price ? `R${p.takealot_price}` : "-"}</td>
                      <td className="px-5 py-4 text-indigo-400">{p.amazon_price ? `R${p.amazon_price}` : "-"}</td>
                      <td className="px-5 py-4">{p.stock_quantity}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${p.status === "active" ? "bg-green-900/40 text-green-400" : p.status === "draft" ? "bg-yellow-900/40 text-yellow-400" : "bg-slate-800 text-slate-500"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-indigo-400 hover:text-indigo-300 text-xs">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="font-black">Recent Orders</h2>
            </div>
            {loading ? (
              <div className="p-10 text-center text-slate-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No orders yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-slate-500 border-b border-slate-800">
                  {["Order #", "Marketplace", "Customer", "Qty", "Sale Price", "Profit", "Status", "Date"].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs">{o.order_number}</td>
                      <td className="px-5 py-4 capitalize">{o.marketplace}</td>
                      <td className="px-5 py-4">{o.customer_name || "-"}</td>
                      <td className="px-5 py-4">{o.quantity}</td>
                      <td className="px-5 py-4 text-green-400">R{o.sale_price}</td>
                      <td className="px-5 py-4 text-yellow-400">{o.profit ? `R${o.profit}` : "-"}</td>
                      <td className={`px-5 py-4 capitalize ${statusColor(o.status)}`}>{o.status}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h2 className="font-black mb-6">Analytics</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Total Products</div>
                <div className="text-3xl font-black text-indigo-400">{products.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Total Orders</div>
                <div className="text-3xl font-black text-green-400">{orders.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Avg Order Value</div>
                <div className="text-3xl font-black text-yellow-400">
                  R{orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : "0"}
                </div>
              </div>
            </div>
            <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold mb-4">Orders by Marketplace</h3>
              <div className="space-y-3">
                {["takealot", "amazon", "makro", "bobshop"].map(mp => {
                  const count = orders.filter(o => o.marketplace === mp).length
                  const pct = orders.length > 0 ? (count / orders.length) * 100 : 0
                  return (
                    <div key={mp} className="flex items-center gap-4">
                      <div className="w-24 text-sm capitalize text-slate-400">{mp}</div>
                      <div className="flex-1 bg-slate-700/50 rounded-full h-3">
                        <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-xs text-slate-500 w-16 text-right">{count} orders</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h2 className="font-black mb-6">Settings</h2>
            <p className="text-slate-400 text-sm">Account and integration settings coming soon.</p>
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-black text-xl mb-6">{editProduct ? "Edit Product" : "Add Product"}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Product Name *</label>
                    <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">SKU *</label>
                    <input value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Cost Price (R)</label>
                    <input type="number" step="0.01" value={formData.cost_price} onChange={e => setFormData(p => ({ ...p, cost_price: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Takealot (R)</label>
                    <input type="number" step="0.01" value={formData.takealot_price} onChange={e => setFormData(p => ({ ...p, takealot_price: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Amazon SA (R)</label>
                    <input type="number" step="0.01" value={formData.amazon_price} onChange={e => setFormData(p => ({ ...p, amazon_price: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Makro (R)</label>
                    <input type="number" step="0.01" value={formData.makro_price} onChange={e => setFormData(p => ({ ...p, makro_price: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Stock Quantity</label>
                    <input type="number" value={formData.stock_quantity} onChange={e => setFormData(p => ({ ...p, stock_quantity: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Min Stock Alert</label>
                    <input type="number" value={formData.min_stock_alert} onChange={e => setFormData(p => ({ ...p, min_stock_alert: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-slate-400">AI Title</label>
                    <button type="button" onClick={generateAIDescription} disabled={aiLoading || !formData.name}
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50">
                      {aiLoading ? "Generating..." : "Generate with AI"}
                    </button>
                  </div>
                  <input value={formData.ai_title} onChange={e => setFormData(p => ({ ...p, ai_title: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">AI Description</label>
                  <textarea value={formData.ai_description} onChange={e => setFormData(p => ({ ...p, ai_description: e.target.value }))} rows={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 text-sm">
                    {saving ? "Saving..." : editProduct ? "Update Product" : "Create Product"}
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
