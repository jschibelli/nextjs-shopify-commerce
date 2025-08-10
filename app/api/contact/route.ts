import { RateLimiter } from '@/lib/security'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

// Server-side only
const resendApiKey = process.env.RESEND_API_KEY

// Minimal allowlist of recipient(s) — adjust as needed
const CONTACT_TO = process.env.CONTACT_TO || process.env.SITE_CONTACT_EMAIL || process.env.CONTACT_FROM
const CONTACT_FROM = process.env.CONTACT_FROM || 'Acme <onboarding@resend.dev>'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().min(5).max(200),
  message: z.string().min(10).max(5000),
  hcaptchaToken: z.string().min(1).optional(),
})

const limiter = new RateLimiter()

async function verifyHCaptcha(token: string, remoteip?: string) {
  const secret = process.env.HCAPTCHA_SECRET
  if (!secret) return { success: false, reason: 'Missing hCaptcha secret' }

  const params = new URLSearchParams()
  params.set('secret', secret)
  params.set('response', token)
  if (remoteip) params.set('remoteip', remoteip)

  const res = await fetch('https://api.hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    // Ensure server runtime
    cache: 'no-store',
  })

  if (!res.ok) return { success: false, reason: 'hCaptcha verify failed' }
  const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] }
  return { success: !!data.success, reason: data['error-codes']?.join(', ') }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 415 })
    }

    const body = await req.json()

    const parsed = contactSchema.safeParse({
      name: String(body?.name ?? ''),
      email: String(body?.email ?? ''),
      message: String(body?.message ?? ''),
      hcaptchaToken: body?.hcaptchaToken ? String(body.hcaptchaToken) : undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    // Basic per-IP rate limit (5 per 15 minutes)
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIP = req.headers.get('x-real-ip')
    const ip = (forwardedFor?.split(',')[0] || realIP || '127.0.0.1').trim()
    const limited = limiter.isRateLimited(`contact:${ip}`, 5, 15 * 60 * 1000)
    if (limited) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    // Verify hCaptcha when configured and not in demo mode
    const isDemo = process.env.DEMO_MODE === 'true'
    const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY
    const needsCaptcha = !!sitekey && !isDemo
    if (needsCaptcha) {
      const token = parsed.data.hcaptchaToken
      if (!token) {
        return NextResponse.json({ error: 'CAPTCHA required' }, { status: 400 })
      }
      const result = await verifyHCaptcha(token, ip)
      if (!result.success) {
        return NextResponse.json({ error: 'CAPTCHA failed', details: result.reason }, { status: 400 })
      }
    }

    if (!resendApiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }
    if (!CONTACT_TO) {
      return NextResponse.json({ error: 'Contact recipient not configured' }, { status: 500 })
    }

    const resend = new Resend(resendApiKey)

    const { name, email, message } = parsed.data
    const subject = `New contact form submission from ${name}`

    if (isDemo) {
      return NextResponse.json({ ok: true, demo: true, message: 'Message queued (demo mode)' })
    }

    const html = `
      <div>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap">${message}</p>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: CONTACT_FROM!,
      to: CONTACT_TO!,
      replyTo: email,
      subject,
      html,
    })

    if (error) {
      return NextResponse.json({ error: error?.message || 'Failed to send' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, id: data?.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
} 