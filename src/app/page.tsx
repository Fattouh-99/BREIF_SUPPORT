import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Import critical components directly (needed for initial render)
import { LandingNavbar } from '@/components/navbar/landing-navbar';
import { HeroSection } from '@/components/hero-section';
import { ParallaxBackground } from '@/components/motion/parallax-scroll';

// Loading fallbacks
const SectionLoader = () => <div className="w-full min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

// Import non-critical components using dynamic loading with more granular code splitting
const FeaturesSection = dynamic(() => import('@/components/features-section').then(mod => ({ default: mod.FeaturesSection })), { 
  ssr: false, 
  loading: () => <SectionLoader /> 
});

const PricingSection = dynamic(() => import('@/components/pricing-section').then(mod => ({ default: mod.PricingSection })), { 
  ssr: false, 
  loading: () => <SectionLoader /> 
});

const NewsletterSection = dynamic(() => import('@/components/newsletter-section').then(mod => ({ default: mod.NewsletterSection })), { 
  ssr: false, 
  loading: () => <SectionLoader /> 
});

const CustomerFeedbackSection = dynamic(() => import('@/components/customer-feedback-section').then(mod => ({ default: mod.CustomerFeedbackSection })), { 
  ssr: false, 
  loading: () => <SectionLoader /> 
});

const Footer = dynamic(() => import('@/components/footer/index'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-muted/20"></div>
});

const WebsiteFeedbackBot = dynamic(() => import('@/components/website-feedback-bot'), { 
  ssr: false,
  loading: () => null
});

const HowItWorksSection = dynamic(() => import('@/components/how-it-works-section').then(mod => ({ default: mod.HowItWorksSection })), { 
  ssr: false, 
  loading: () => <SectionLoader /> 
});

const StatsResultsSection = dynamic(() => import('@/components/stats-results-section').then(mod => ({ default: mod.StatsResultsSection })), { 
  ssr: false, 
  loading: () => <SectionLoader /> 
});

// Set up metadata for SEO
export const metadata: Metadata = {
  title: 'Brief Support - AI-Powered Sales Assistant | 24/7 Customer Support',
  description: 'Empower your business with cutting-edge AI solutions that drive efficiency, insights, and growth. Brief Support helps companies leverage artificial intelligence technology to solve complex problems.',
  keywords: 'AI solutions, artificial intelligence, machine learning, data analytics, business intelligence, tech startup',
  openGraph: {
    title: 'Brief Support - AI-Powered Sales Assistant | 24/7 Customer Support',
    description: 'Empower your business with cutting-edge AI solutions that drive efficiency, insights, and growth.',
    url: 'https://briefsupport.com',
    siteName: 'Brief Support',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Brief Support - AI-Powered Sales Assistant | 24/7 Customer Support'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brief Support - AI-Powered Sales Assistant | 24/7 Customer Support',
    description: 'Empower your business with cutting-edge AI solutions that drive efficiency, insights, and growth.',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://briefsupport.com',
  }
};

export default function Home() {
  // Adding real images to enhance visual appeal and interactivity
  // - Hero Section: Using the existing bot-ui.png image as dashboard
  // - Features Section: Using the Intelligent_Conversations.png for showcase
  // - Testimonials: Using placeholder avatar images
  // - Customer Feedback: Adding new visual elements
  // - Newsletter Section: Adding visual appeal with illustrations
  
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-background via-background to-background/80 overflow-hidden">
      {/* Background */}
      <ParallaxBackground />
      
      {/* Navbar */}
      <LandingNavbar />
      
      {/* Hero Section - Critical above the fold */}
      <section id="hero" className="relative min-h-[90vh] md:min-h-screen flex items-center pt-16 sm:pt-20 md:pt-24 lg:pt-32 overflow-hidden">
        <HeroSection />
      </section>

      {/* Below-the-fold content wrapped in Suspense boundaries */}
      <Suspense fallback={<SectionLoader />}>
        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 sm:py-20 md:py-24 lg:pt-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          <HowItWorksSection />
        </section>
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 md:py-24 lg:pt-32 relative overflow-hidden">
          <FeaturesSection />
        </section>
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        {/* Stats & Results Section */}
        <section id="stats" className="py-16 sm:py-20 md:py-24 lg:pt-32 relative overflow-hidden bg-gradient-to-b from-muted/30 to-background">
          <StatsResultsSection />
        </section>
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        {/* Pricing Section */}
        <section id="pricing" className="py-16 sm:py-20 md:py-24 lg:pt-32 relative overflow-hidden">
          <PricingSection />
        </section>
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        {/* Customer Feedback Section */}
        <section id="customer-feedback" className="py-16 sm:py-20 md:py-24 lg:pt-32 relative overflow-hidden bg-muted/30">
          <CustomerFeedbackSection />
        </section>
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        {/* Newsletter Section */}
        <section id="newsletter" className="py-16 sm:py-20 md:py-24 lg:pt-32 relative overflow-hidden">
          <NewsletterSection />
        </section>
      </Suspense>
      
      {/* Integration Platform Showcase */}
      {/* <section id="integrations" className="py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <IntegrationShowcaseSection />
      </section> */}
      
      {/* Website Feedback Bot - load last */}
      <WebsiteFeedbackBot position="bottom-right" accentColor="#4f46e5" />
      
      <Footer />
    </main>
  );
}
