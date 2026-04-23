import { Metadata } from 'next';

export type MetadataProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  canonicalPath?: string;
};

/**
 * Generate metadata for Next.js pages with proper SEO defaults
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  image = 'https://ucarecdn.com/fa64c83f-9647-445d-bc47-f576b71f557d/',
  noIndex = false,
  canonicalPath,
}: MetadataProps): Metadata {
  const metaTitle = title 
    ? `${title} | Brief Support` 
    : 'Brief Support - AI-Powered Sales Assistant | 24/7 Customer Support';
  
  const metaDescription = description || 
    'Transform your website with our AI-powered sales assistant. Boost conversion rates up to 50% with 24/7 customer support.';
  
  const defaultKeywords = [
    'AI sales assistant', 
    'customer support', 
    'chatbot', 
    'GPT-4', 
    'conversion optimization'
  ];
  
  // Create a combined array with duplicates removed
  const allKeywords = [...defaultKeywords, ...keywords]
    .filter((value, index, self) => self.indexOf(value) === index)
    .join(', ');
  
  return {
    title: metaTitle,
    description: metaDescription,
    keywords: allKeywords,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [image],
    },
    ...(canonicalPath && {
      alternates: {
        canonical: canonicalPath,
      },
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
} 