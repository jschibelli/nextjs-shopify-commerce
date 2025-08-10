import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo mode disabled' }, { status: 403 })
  }

  const customerEmail = process.env.DEMO_CUSTOMER_EMAIL || 'demo+customer@example.com'
  const adminEmail = process.env.DEMO_ADMIN_EMAIL || 'demo+admin@example.com'
  const password = process.env.DEMO_PASSWORD || 'demo'

  return NextResponse.json({ customerEmail, adminEmail, password })
} 