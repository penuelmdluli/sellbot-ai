import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export async function POST(req: NextRequest) {
  try {
    const { productName, category, keyFeatures, marketplace } = await req.json()
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514", max_tokens: 600,
      system: "You are an expert SA e-commerce copywriter for Takealot/Amazon SA. Return ONLY valid JSON.",
      messages: [{ role: "user", content: `Generate listing for: ${productName}, Category: ${category}, Features: ${keyFeatures}, Platform: ${marketplace || "Takealot"}. Return JSON: {"title":"...","short_description":"...","bullet_points":["..."],"long_description":"...","keywords":["..."],"suggested_price_range":"R XXX - R XXX"}` }]
    })
    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const listing = JSON.parse(text.replace(/```json|```/g, "").trim())
    return NextResponse.json({ success: true, listing })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
