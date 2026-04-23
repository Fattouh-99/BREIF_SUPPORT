import type { Metadata } from 'next'
import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from '@/context/them-provider'
import { Toaster } from '@/components/ui/toaster'
import MaintenanceBanner from '@/components/maintenance-banner'
import { Providers } from './providers'
import GoogleAnalytics from '@/components/analytics/google-analytics'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Suspense, lazy } from 'react'
import { ClerkProviderWrapper } from '@/components/auth/clerk-provider-wrapper'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { cn } from '@/lib/utils'

// Optimize fonts with subset selection and display swap
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  weight: ['400', '500', '600', '700', '800'],
})

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Ensure text remains visible during webfont load
  variable: '--font-inter',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Brief Support - AI-Powered Sales Assistant | 24/7 Customer Support',
  description: 'Transform your website with our AI-powered sales assistant. Boost conversion rates up to 50% with 24/7 customer support. Try Brief Support free today.',
  keywords: 'AI sales assistant, customer support, chatbot, GPT-4, conversion optimization',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.briefsupport.com'),
  openGraph: {
    title: 'Brief Support - AI-Powered Sales Assistant',
    description: 'Transform your website with our AI-powered sales assistant. Boost conversion rates up to 50% with 24/7 customer support.',
    images: [
      {
        url: 'https://ucarecdn.com/fa64c83f-9647-445d-bc47-f576b71f557d/',
        width: 500,
        height: 100,
        alt: 'Brief Support Logo',
      },
    ],
    type: 'website',
    locale: 'en_US',
    siteName: 'Brief Support',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brief Support - AI-Powered Sales Assistant',
    description: 'Transform your website with our AI-powered sales assistant.',
    images: ['https://ucarecdn.com/fa64c83f-9647-445d-bc47-f576b71f557d/'],
  },
  alternates: {
    canonical: 'https://www.briefsupport.com/'
  },
  authors: [{ name: 'Brief Support Team', url: 'https://www.briefsupport.com' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Add Clerk environment validation script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Validate Clerk environment variables
                if (typeof window !== 'undefined') {
                  const clerkKey = '${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}';
                  if (!clerkKey || clerkKey === 'undefined') {
                    console.warn('Clerk publishable key not found. Authentication may not work properly.');
                  }
                  
                  // Add network error handling for Clerk
                  window.addEventListener('unhandledrejection', function(event) {
                    if (event.reason?.message?.includes('clerk') || 
                        event.reason?.message?.includes('Failed to fetch') ||
                        event.reason?.toString?.().includes('easy-oarfish-9.clerk.accounts.dev')) {
                      console.warn('Clerk network error caught:', event.reason);
                      event.preventDefault(); // Prevent the error from crashing the app
                    }
                  });
                }
              `,
            }}
          />
          
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'Brief Support',
                applicationCategory: 'BusinessApplication',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  ratingCount: '1000',
                },
              }),
            }}
          />
          {/* Optimize analytics loading */}
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          
          {/* Critical preloads and preconnects */}
          <link rel="preconnect" href="https://accounts.dev" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://accounts.dev" />
          <link rel="preconnect" href="https://easy-oarfish-9.clerk.accounts.dev" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://easy-oarfish-9.clerk.accounts.dev" />
          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* Favicon and app icons - ordered by browser preference */}
          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <link rel="icon" href="/icons/Icon-Only-Color.svg?v=2" type="image/svg+xml" />
          <link rel="icon" href="/favicon_io/favicon-32x32.png?v=2" sizes="32x32" type="image/png" />
          <link rel="icon" href="/favicon_io/favicon-16x16.png?v=2" sizes="16x16" type="image/png" />
          <link rel="apple-touch-icon" href="/favicon_io/apple-touch-icon.png?v=2" sizes="180x180" />
          <link rel="manifest" href="/favicon_io/site.webmanifest?v=2" />
          
          {/* Additional meta tags for better SEO and social sharing */}
          <meta name="msapplication-TileColor" content="#6366f1" />
          <meta name="theme-color" content="#6366f1" />
          <meta name="application-name" content="Brief Support" />
          <meta name="apple-mobile-web-app-title" content="Brief Support" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
          <link rel="preload" as="image" href="/images/bot-ui.png" fetchPriority="high" />
          <style dangerouslySetInnerHTML={{
            __html: `
              body { display: block; margin: 0; }
              .critical-hidden { opacity: 0; }
              .critical-visible { opacity: 1; transition: opacity 0.2s; }
              
              /* Reduce CLS */
              .layout-shift-fix { min-height: 100vh; }
              
              /* Optimize content visibility */
              .content-visibility-auto { content-visibility: auto; }
            `
          }} />
        </head>
        <body className={cn('min-h-screen bg-background font-sans antialiased', jakarta.className, inter.variable)} suppressHydrationWarning>
          <ClerkProviderWrapper>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
                <TooltipProvider>
                  <Providers>
                    <div className="flex flex-col min-h-screen layout-shift-fix">
                      <MaintenanceBanner />
                      <main id="main-content" tabIndex={-1} className="flex-grow has-navbar-and-banner-spacing">
                        <Suspense fallback={
                          <div className="flex items-center justify-center w-full min-h-screen">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
                              <p className="text-muted-foreground">Loading...</p>
                            </div>
                          </div>
                        }>
                          {children}
                        </Suspense>
                      </main>
                    </div>
                  </Providers>
                </TooltipProvider>
            </ThemeProvider>
          </ClerkProviderWrapper>
          <Toaster />
          
          {/* Load analytics with low priority */}
          <Suspense fallback={null}>
            <Analytics />
            <SpeedInsights />
          </Suspense>
        </body>
      </html>
  )
}
