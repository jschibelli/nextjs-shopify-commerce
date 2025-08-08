import { GeistSans } from 'geist/font/sans';
import type { Metadata, Viewport } from 'next';

import { EnhancedCartProvider } from 'components/cart/enhanced-cart-context';
import EnhancedCartModal from 'components/cart/enhanced-cart-modal';
import DevRevalidateButton from 'components/dev-revalidate-button';
import Footer from 'components/layout/footer';
import Navbar from 'components/layout/navbar';
import { ThemeProvider } from 'components/theme-provider';
import { WelcomeToast } from 'components/welcome-toast';
import { WishlistProvider } from 'components/wishlist/wishlist-context';
import { getCart } from 'lib/shopify';
import { Toaster } from 'sonner';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Next.js Commerce',
    template: '%s | Next.js Commerce'
  },
  description: 'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
  keywords: ['Next.js', 'React', 'JavaScript', 'Shopify', 'Commerce'],
  authors: [
    {
      name: 'Vercel',
      url: 'https://vercel.com'
    }
  ],
  creator: 'Vercel',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nextjs-commerce.vercel.app',
    title: 'Next.js Commerce',
    description: 'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
    siteName: 'Next.js Commerce'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next.js Commerce',
    description: 'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
    images: ['https://nextjs-commerce.vercel.app/og.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'google-site-verification-code'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <EnhancedCartProvider cartPromise={cart}>
            <WishlistProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <EnhancedCartModal />
              <WelcomeToast />
              <DevRevalidateButton />
              <Toaster closeButton />
            </WishlistProvider>
          </EnhancedCartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
