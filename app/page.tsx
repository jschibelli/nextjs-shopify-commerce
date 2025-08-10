import { FeaturedCollection } from '@/components/featured-collection'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  description: 'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
  openGraph: { type: 'website' }
}

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-foreground">New Season Essentials</h1>
            <p className="text-muted-foreground text-lg max-w-prose">Refresh your wardrobe with trending looks and timeless staples curated for you.</p>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link href="/search?collection=new-arrivals">Shop New Arrivals</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/search?collection=hydrogen">Shop Best Sellers</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
              <Image src="/hero-1.jpg" alt="Women collection" fill className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
              <Image src="/hero-2.jpg" alt="Men collection" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="py-10 lg:py-16 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Women', emoji: '👗', href: '/search?collection=new-arrivals' },
              { label: 'Men', emoji: '👔', href: '/search?collection=hydrogen' },
              { label: 'Outerwear', emoji: '🧥', href: '/search' },
              { label: 'Accessories', emoji: '👜', href: '/search' },
              { label: 'Shoes', emoji: '👟', href: '/search' },
              { label: 'Sale', emoji: '🔥', href: '/search?collection=new-arrivals' }
            ].map((c) => (
              <Link key={c.label} href={c.href} className="group">
                <div className="aspect-square rounded-lg bg-background border flex items-center justify-center text-3xl">
                  <span aria-hidden>{c.emoji}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-center group-hover:underline">{c.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals - carousel */}
      {await FeaturedCollection({
        collectionHandle: 'new-arrivals',
        title: 'New Arrivals',
        description: 'Fresh styles just dropped',
        maxProducts: 8,
        variant: 'carousel'
      })}

      {/* Best Sellers - grid */}
      {await FeaturedCollection({
        collectionHandle: 'hydrogen',
        title: 'Best Sellers',
        description: 'Customer favorites you will love',
        maxProducts: 6,
        variant: 'grid'
      })}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-xl bg-foreground text-background p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Up to 20% off selected lines</h2>
            <p className="text-background/80">Limited time only. Terms apply.</p>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/search?collection=hydrogen">Shop Deals</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

