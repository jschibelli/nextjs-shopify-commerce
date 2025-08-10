import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      title,
      tags,
      vendor,
      productType,
      tone = 'concise, benefit-led, SEO-friendly',
      maxChars = 500
    } = body || {}

    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || ''
    const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
    const model = process.env.AI_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini'

    if (!apiKey && baseUrl.includes('api.openai.com')) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    }

    const system = `You are an ecommerce copywriter for a Shopify store. Write engaging, scannable product descriptions with short paragraphs, bullets, and clear benefits. Optimize lightly for SEO. Keep under ${maxChars} characters.`

    const user = [
      `Title: ${title}`,
      vendor ? `Vendor: ${vendor}` : undefined,
      productType ? `Type: ${productType}` : undefined,
      tags ? `Tags: ${tags}` : undefined,
      `Tone: ${tone}`,
      'Write a single paragraph followed by 3-5 bullet points.'
    ]
      .filter(Boolean)
      .join('\n')

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const resp = await fetch(`${baseUrl}/responses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: `AI provider error: ${text}` }, { status: 500 })
    }

    const data = await resp.json()
    const text = (data.output_text as string | undefined)?.trim() || ''

    return NextResponse.json({ description: text })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
} 