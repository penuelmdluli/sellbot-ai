import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { products } = await req.json()
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Products array is required" }, { status: 400 })
    }

    const rows = products.map((p: any) => ({
      user_id: user.id,
      name: p.name,
      sku: p.sku,
      cost_price: parseFloat(p.cost_price) || 0,
      takealot_price: p.takealot_price ? parseFloat(p.takealot_price) : null,
      amazon_price: p.amazon_price ? parseFloat(p.amazon_price) : null,
      makro_price: p.makro_price ? parseFloat(p.makro_price) : null,
      stock_quantity: parseInt(p.stock_quantity) || 0,
      min_stock_alert: parseInt(p.min_stock_alert) || 10,
      status: p.status || "active",
    }))

    const { data, error } = await supabase
      .from("products")
      .insert(rows)
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, count: data?.length || 0 }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
