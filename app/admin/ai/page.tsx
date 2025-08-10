'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function AdminAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: 'Hi! I can help with product copy, collection ideas, bulk ops suggestions, and more.'
  }])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || streaming) return
    const next = [...messages, { role: 'user' as const, content: input.trim() }]
    setMessages(next)
    setInput('')

    setStreaming(true)
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: next })
    })

    const json = await res.json().catch(() => ({ error: 'Network error' }))
    if (!res.ok || json.error) {
      setMessages(m => [...m, { role: 'assistant', content: json.error || 'Sorry, something went wrong.' }])
      setStreaming(false)
      return
    }

    const text = (json.text as string) || ''
    setMessages(m => [...m, { role: 'assistant', content: text }])
    setStreaming(false)
  }

  const quickPrompts = [
    'Draft an SEO title and meta description for a new “Eco Water Bottle”.',
    'Summarize top-selling product features for our homepage hero.',
    'Suggest 5 collection ideas using our current tags.',
    'Write a concise return policy highlight for the cart page.',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <Link href="/admin" className="text-sm text-muted-foreground hover:underline">Back to Dashboard</Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={containerRef} className="h-[420px] overflow-auto rounded border p-3 mb-3 bg-background">
            {messages.map((m, i) => (
              <div key={i} className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">{m.role}</div>
                <div className="whitespace-pre-wrap text-sm">{m.content}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((q, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => setInput(q)}>
                  {q}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask the assistant…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send() }}
              />
              <Button onClick={send} disabled={streaming}>Send</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate Product Description</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input id="g-title" placeholder="Title" />
            <Input id="g-vendor" placeholder="Vendor (optional)" />
            <Input id="g-type" placeholder="Type (optional)" />
            <Input id="g-tags" placeholder="Tags, comma-separated (optional)" />
          </div>
          <Textarea id="g-output" placeholder="Output will appear here…" className="min-h-[140px]" />
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                const title = (document.getElementById('g-title') as HTMLInputElement)?.value
                if (!title) return
                const vendor = (document.getElementById('g-vendor') as HTMLInputElement)?.value
                const productType = (document.getElementById('g-type') as HTMLInputElement)?.value
                const tags = (document.getElementById('g-tags') as HTMLInputElement)?.value
                const res = await fetch('/api/ai/generate-description', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title, vendor, productType, tags })
                })
                const json = await res.json()
                ;(document.getElementById('g-output') as HTMLTextAreaElement).value = json.description || json.error || 'No result'
              }}
            >
              Generate
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                ;(document.getElementById('g-title') as HTMLInputElement).value = ''
                ;(document.getElementById('g-vendor') as HTMLInputElement).value = ''
                ;(document.getElementById('g-type') as HTMLInputElement).value = ''
                ;(document.getElementById('g-tags') as HTMLInputElement).value = ''
                ;(document.getElementById('g-output') as HTMLTextAreaElement).value = ''
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 