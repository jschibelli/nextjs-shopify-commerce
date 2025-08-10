"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import Script from 'next/script'
import { useRef, useState } from 'react'

const HC_SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY

export default function ContactPage() {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const captchaRef = useRef<HCaptcha | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim().length < 2) {
      toast({ title: 'Name too short', description: 'Please enter at least 2 characters.', variant: 'destructive' })
      return
    }
    if (!/.+@.+\..+/.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' })
      return
    }
    if (message.trim().length < 10) {
      toast({ title: 'Message too short', description: 'Please provide more details (min 10 chars).', variant: 'destructive' })
      return
    }
    if (!HC_SITEKEY) {
      toast({ title: 'CAPTCHA not configured', description: 'Missing site key.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, hcaptchaToken: captchaToken }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const status = res.status
        const detail = json?.details ? (typeof json.details === 'string' ? json.details : JSON.stringify(json.details)) : undefined
        const base = json?.error || 'Failed to send'
        const msg = detail ? `${base}: ${detail}` : base
        if (status === 429) {
          throw new Error('Too many requests. Please try again later.')
        }
        if (status === 400 && /captcha/i.test(base)) {
          throw new Error(msg || 'CAPTCHA failed. Please retry.')
        }
        if (status >= 500) {
          throw new Error(msg || 'Server error. Please try again later.')
        }
        throw new Error(msg)
      }

      toast({ title: 'Message sent', description: json?.demo ? 'Sent in demo mode.' : 'We will get back to you shortly.' })
      setName('')
      setEmail('')
      setMessage('')
      setCaptchaToken(undefined)
      captchaRef.current?.resetCaptcha()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast({ title: 'Send failed', description: msg, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Script src="https://js.hcaptcha.com/1/api.js" strategy="afterInteractive" />
      <h1 className="mb-6 text-3xl font-semibold">Contact Us</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        {HC_SITEKEY && (
          <div className="pt-2">
            <HCaptcha
              ref={captchaRef as any}
              sitekey={HC_SITEKEY}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(undefined)}
            />
          </div>
        )}
        <Button type="submit" disabled={submitting || !captchaToken} className="w-full">
          {submitting ? 'Sending…' : 'Send Message'}
        </Button>
      </form>
    </div>
  )
} 