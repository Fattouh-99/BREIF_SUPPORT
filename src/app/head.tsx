export default function Head() {
  return (
    <>
      {/* Resource hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://accounts.dev" />
      <link rel="dns-prefetch" href="https://api.briefsupport.com" />
      
      {/* Core Web Vitals optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Progressive enhancement - helps with LCP */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Initial critical CSS */
        html { scroll-behavior: smooth; }
        body { display: block; opacity: 1; }
        .lcp-image { content-visibility: auto; }
        
        /* Prevent layout shift */
        main { min-height: 100vh; }
        
        /* Disable animations if user prefers reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after {
            animation-delay: -1ms !important;
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            background-attachment: initial !important;
            scroll-behavior: auto !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        }
      `}} />
      
      {/* Preload critical hero image */}
      <link rel="preload" as="image" href="/images/bot-ui.png" fetchPriority="high" />
    </>
  )
} 