"use client"
import { useState, useRef } from "react"
import Link from "next/link"
import Papa from "papaparse"

type PreviewRow = {
  name: string; sku: string; cost_price: string; takealot_price: string;
  amazon_price: string; makro_price: string; stock_quantity: string;
}

export default function CSVImportPage() {
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fileName, setFileName] = useState("")
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[]
        if (data.length > 0) {
          setHeaders(Object.keys(data[0]))
        }
        setPreview(data.slice(0, 100).map(row => ({
          name: row.name || row.Name || row.product_name || "",
          sku: row.sku || row.SKU || "",
          cost_price: row.cost_price || row.cost || row.CostPrice || "0",
          takealot_price: row.takealot_price || row.takealot || row.TakealotPrice || "",
          amazon_price: row.amazon_price || row.amazon || row.AmazonPrice || "",
          makro_price: row.makro_price || row.makro || row.MakroPrice || "",
          stock_quantity: row.stock_quantity || row.stock || row.quantity || row.Stock || "0",
        })))
      }
    })
  }

  const handleImport = async () => {
    if (preview.length === 0) return
    setImporting(true)
    setResult(null)
    try {
      const validProducts = preview.filter(p => p.name && p.sku)
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: validProducts })
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ success: true, count: data.count })
        setPreview([])
        setFileName("")
        if (fileRef.current) fileRef.current.value = ""
      } else {
        setResult({ success: false, error: data.error })
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message })
    }
    setImporting(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex">
      <aside className="w-56 border-r border-slate-800 p-5 flex flex-col gap-1 fixed h-full">
        <Link href="/dashboard" className="font-black text-lg mb-8 block">Sell<span className="text-indigo-400">Bot</span> AI</Link>
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300">Products</Link>
        <Link href="/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300">Pricing Rules</Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">CSV Import</div>
      </aside>
      <main className="ml-56 flex-1 p-8">
        <h1 className="font-black text-2xl mb-6">Bulk CSV Import</h1>

        {/* Upload area */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-6">
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-slate-400 mb-4">Upload a CSV file with your product data</p>
            <p className="text-xs text-slate-600 mb-6">Expected columns: name, sku, cost_price, takealot_price, amazon_price, makro_price, stock_quantity</p>
            <input type="file" accept=".csv" ref={fileRef} onChange={handleFile}
              className="hidden" id="csv-upload" />
            <label htmlFor="csv-upload"
              className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-500 transition-colors cursor-pointer text-sm">
              Choose CSV File
            </label>
            {fileName && <p className="mt-4 text-sm text-indigo-400">{fileName}</p>}
          </div>
        </div>

        {/* Result message */}
        {result && (
          <div className={`mb-6 p-4 rounded-xl border ${result.success ? "bg-green-900/30 border-green-500/40 text-green-300" : "bg-red-900/30 border-red-500/40 text-red-300"}`}>
            {result.success ? `Successfully imported ${result.count} products!` : `Error: ${result.error}`}
          </div>
        )}

        {/* Preview table */}
        {preview.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-black">Preview</h2>
                <p className="text-xs text-slate-500 mt-1">{preview.length} rows found ({preview.filter(p => p.name && p.sku).length} valid)</p>
              </div>
              <button onClick={handleImport} disabled={importing}
                className="bg-green-600 text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50">
                {importing ? "Importing..." : `Import ${preview.filter(p => p.name && p.sku).length} Products`}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-slate-500 border-b border-slate-800">
                  {["#", "Name", "SKU", "Cost", "Takealot", "Amazon", "Makro", "Stock", "Valid"].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {preview.map((row, i) => {
                    const valid = row.name && row.sku
                    return (
                      <tr key={i} className={`border-b border-slate-800/50 ${!valid ? "opacity-50" : ""}`}>
                        <td className="px-5 py-3 text-slate-500">{i + 1}</td>
                        <td className="px-5 py-3 font-medium">{row.name || <span className="text-red-400">Missing</span>}</td>
                        <td className="px-5 py-3 font-mono text-xs">{row.sku || <span className="text-red-400">Missing</span>}</td>
                        <td className="px-5 py-3">{row.cost_price ? `R${row.cost_price}` : "-"}</td>
                        <td className="px-5 py-3 text-green-400">{row.takealot_price ? `R${row.takealot_price}` : "-"}</td>
                        <td className="px-5 py-3 text-indigo-400">{row.amazon_price ? `R${row.amazon_price}` : "-"}</td>
                        <td className="px-5 py-3">{row.makro_price ? `R${row.makro_price}` : "-"}</td>
                        <td className="px-5 py-3">{row.stock_quantity || "0"}</td>
                        <td className="px-5 py-3">{valid ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
