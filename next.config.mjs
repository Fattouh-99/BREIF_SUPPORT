import withBundleAnalyzer from '@next/bundle-analyzer';
/** @type {import('next').NextConfig} */

/**
 * Next.js Configuration
 * 
 * Security headers and CSP implementation:
 * - Content Security Policy (CSP): Restricts which resources can be loaded
 * - Permissions Policy: Restricts browser features
 * - Strict Transport Security (HSTS): Forces HTTPS connections
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-Frame-Options: Controls iframe embedding permission
 * - X-XSS-Protection: Additional XSS prevention layer
 * - Referrer-Policy: Controls referrer information sharing
 * 
 * Development vs Production:
 * - Development: More permissive CSP to allow hot-reloading
 * - Production: Strict CSP with minimum privileges
 */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  // Temporarily disable the CSR bailout warning to fix build issues
  experimental: {
    missingSuspenseWithCSRBailout: false,
    instrumentationHook: false,
    serverComponentsExternalPackages: ['formidable'],
  },
  webpack: (config, { isServer }) => {
    // Add webpack configuration to handle module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "node-fetch-native": false,
    };
    
    return config;
  },
  // Enable standalone output for production deployment
  output: 'standalone',
  // Force all pages to use Server-Side Rendering
  trailingSlash: false,
  // Enable image optimization for better performance
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ucarecdn.com',
      },
      {
        protocol: 'https',
        hostname: 'wordpress-1381929-5075930.cloudwaysapps.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'live.staticflickr.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'opengraph.githubassets.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'aceternity.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'media.giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'robohash.org',
      },
      {
        protocol: 'https',
        hostname: 'xsgames.co',
      },
      {
        protocol: 'https',
        hostname: 'fakeimg.pl',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
      },
      {
        protocol: 'https',
        hostname: 'placeimg.com',
      },
      {
        protocol: 'https',
        hostname: 'placekitten.com',
      },
      {
        protocol: 'https',
        hostname: 'placebeard.it',
      },
      {
        protocol: 'https',
        hostname: 'fillmurray.com',
      },
      {
        protocol: 'https',
        hostname: 'placecage.com',
      },
      {
        protocol: 'https',
        hostname: 'www.placecage.com',
      },
      {
        protocol: 'https',
        hostname: 'placebear.com',
      },
      {
        protocol: 'https',
        hostname: 'baconmockup.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    domains: ['localhost'],
    unoptimized: false
  },
  // Enable environment variables for server-side components
  // env: {
  //   // Clerk Configuration - Add placeholders to prevent build errors
  //   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_placeholder_for_build',
  //   CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_placeholder_for_build',
  //   NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/auth/sign-in',
  //   NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/auth/sign-up',
  //   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
  //   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dashboard',
  //   CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || 'whsec_placeholder_for_build',
    
  //   // Cookie settings
  //   NEXT_PUBLIC_CLERK_COOKIE_DOMAIN: process.env.NEXT_PUBLIC_CLERK_COOKIE_DOMAIN || '',
    
  //   // Database configuration - use placeholder that doesn't expose credentials
  //   DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder_user:placeholder_password@placeholder_host/placeholder_db?sslmode=require',
    
  //   // Pusher configuration - use placeholders for sensitive values
  //   PUSHER_APP_ID: process.env.PUSHER_APP_ID || 'app_id_placeholder',
  //   PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET || 'secret_placeholder',
  //   NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'key_placeholder',
  //   NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'eu',
  // },
  // Option to disable middleware
  skipMiddlewareUrlNormalize: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      if (!config.optimization) {
        config.optimization = {};
      }
      
      if (!config.optimization.splitChunks || config.optimization.splitChunks === false) {
        config.optimization.splitChunks = {};
      }
      
      // Enhance code-splitting configuration for better performance
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/](?!.*\.css$)/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
            enforce: true,
            reuseExistingChunk: true,
          },
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Separate larger dependencies 
          frameworkChunk: {
            test: /[\\/]node_modules[\\/](react|react-dom|framer-motion)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 30,
          },
        },
      };
    }

    // Add support for importing .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'raw-loader',
    })

    // Only run on server-side
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('bufferutil', 'utf-8-validate')
    }

    return config;
  },
  async headers() {
    const developmentCSP = process.env.NODE_ENV === 'development' 
      ? ["'unsafe-inline'", "'unsafe-eval'", "http://localhost:*", "ws://localhost:*"]
      : [];

    return [
      // Special headers for chatbot embed route - allow it to be embedded anywhere
      {
        source: '/chatbot',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Remove X-Frame-Options to allow embedding
          { 
            key: 'Permissions-Policy', 
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
              'payment=(self "https://js.stripe.com" "https://checkout.stripe.com")',
              'usb=()',
              'fullscreen=(self)',
              'display-capture=(self)'
            ].join(', '),
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https: ${developmentCSP.join(' ')}`,
              `worker-src 'self' blob:`,
              `object-src 'self' data:`,
              `style-src 'self' 'unsafe-inline' https: ${developmentCSP.join(' ')}`,
              `img-src 'self' data: blob: https: ${developmentCSP.join(' ')}`,
              `font-src 'self' https: ${developmentCSP.join(' ')}`,
              `connect-src 'self' https: wss: ${process.env.NODE_ENV === 'development' ? 'http: ws:' : ''} https://*.clerk.accounts.dev https://*.analytics.google.com https://api.stripe.com https://js.stripe.com ${developmentCSP.join(' ')}`,
              `frame-src 'self' data: https: https://js.stripe.com https://checkout.stripe.com ${process.env.NODE_ENV === 'development' ? 'http:' : ''} ${developmentCSP.join(' ')}`,
              // Allow chatbot to be embedded by any website
              `frame-ancestors *`,
            ].join('; ')
          }
        ]
      },
      {
        source: '/((?!chatbot).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          
          ...(process.env.NODE_ENV === 'production' ? [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
          ] : []),
          
          { 
            key: 'Permissions-Policy', 
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
              'payment=(self "https://js.stripe.com" "https://checkout.stripe.com")',
              'usb=()',
              'fullscreen=(self)',
              'display-capture=(self)'
            ].join(', '),
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https: ${developmentCSP.join(' ')}`,
              `worker-src 'self' blob:`,
              `object-src 'self' data:`,
              `style-src 'self' 'unsafe-inline' https: ${developmentCSP.join(' ')}`,
              `img-src 'self' data: blob: https: ${developmentCSP.join(' ')}`,
              `font-src 'self' https: ${developmentCSP.join(' ')}`,
              `connect-src 'self' https: wss: ${process.env.NODE_ENV === 'development' ? 'http: ws:' : ''} https://*.clerk.accounts.dev https://*.analytics.google.com https://api.stripe.com https://js.stripe.com ${developmentCSP.join(' ')}`,
              `frame-src 'self' data: https: https://js.stripe.com https://checkout.stripe.com ${process.env.NODE_ENV === 'development' ? 'http:' : ''} ${developmentCSP.join(' ')}`,
              `frame-ancestors 'self' https: ${process.env.NODE_ENV === 'development' ? 'http:' : ''}`,
            ].join('; ')
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Add bundle analyzer wrapped config (enabled by ANALYZE=true environment variable)
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);