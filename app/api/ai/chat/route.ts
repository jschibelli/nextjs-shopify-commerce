import { getProducts } from '@/lib/shopify'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

async function fetchProductSummaries(query?: string) {
  const items = await getProducts({ query, sortKey: 'RELEVANCE' as any })
  return (items || []).slice(0, 12).map(p => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    minPrice: p.priceRange?.minVariantPrice?.amount,
    maxPrice: p.priceRange?.maxVariantPrice?.amount,
    currency: p.priceRange?.minVariantPrice?.currencyCode,
    tags: p.tags?.slice(0, 6)
  }))
}

function getPolicySnippets() {
  // Minimal placeholders; could be loaded from CMS or pages
  const shipping = 'Standard shipping 3-5 business days. Free over $75.'
  const returns = '30-day returns on unused items. Refund to original payment.'
  const faq = 'Common Q&A about sizing, materials, and support.'
  return { shipping, returns, faq }
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
  }

  const { messages = [], context, productQuery } = await req.json().catch(() => ({ messages: [] }))

  // Build lightweight context
  const policies = getPolicySnippets()
  const products = await fetchProductSummaries(typeof productQuery === 'string' ? productQuery : undefined).catch(() => [])

  const system = `You are an AI assistant for a Shopify storefront. Be concise and helpful. When recommending items, cite title and price range. If asked policies, answer from provided snippets. Do not perform destructive actions.`

  const toolContext = {
    policies,
    products_preview: products,
  }

  const input = [
    { role: 'system', content: system },
    { role: 'system', content: `Context: ${JSON.stringify(toolContext).slice(0, 8000)}` },
    ...(context ? [{ role: 'system', content: `Extra: ${JSON.stringify(context).slice(0, 4000)}` }] : []),
    ...messages
  ]

  const resp = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input
    })
  })

  if (!resp.ok) {
    const text = await resp.text()
    return NextResponse.json({ error: `OpenAI error: ${text}` }, { status: 500 })
  }

  const data = await resp.json()
  const text = (data.output_text as string | undefined)?.trim() || ''

  return NextResponse.json({ text, products })
} 