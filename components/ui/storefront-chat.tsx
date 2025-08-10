'use client'

import { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Input } from './input'

interface Msg { role: 'user'|'assistant'; content: string }

export default function StorefrontChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hi! Ask me about products, shipping, or returns.' }
  ])
  const [busy, setBusy] = useState(false)

  const send = async () => {
    if (!input.trim() || busy) return
    const next = [...messages, { role: 'user' as const, content: input.trim() }]
    setMessages(next)
    setInput('')
    setBusy(true)

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: next })
    })
    const json = await res.json().catch(() => ({ error: 'Network error' }))
    if (!res.ok || json.error) {
      setMessages(m => [...m, { role: 'assistant', content: json.error || 'Something went wrong.' }])
      setBusy(false)
      return
    }

    setMessages(m => [...m, { role: 'assistant', content: json.text || '' }])
    setBusy(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open ? (
        <Button onClick={() => setOpen(true)}>Chat</Button>
      ) : (
        <Card className="w-80 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Assistant</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Close</Button>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto rounded border p-2 mb-2 bg-background text-sm">
              {messages.map((m, i) => (
                <div key={i} className="mb-2">
                  <div className="text-[10px] text-muted-foreground mb-1">{m.role}</div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask about products…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send() }}
              />
              <Button onClick={send} disabled={busy}>Send</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 