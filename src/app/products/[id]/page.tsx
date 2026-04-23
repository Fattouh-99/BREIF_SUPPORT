import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/prisma';
import { ProductDetailSkeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

// Function to fetch product data
async function getProduct(id: string) {
  try {
    const product = await client.product.findUnique({
      where: { id },
      include: {
        Domain: true,
      },
    });
    
    if (!product) {
      return null;
    }
    
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generate static params for static site generation
export async function generateStaticParams() {
  try {
    const products = await client.product.findMany({
      select: { id: true },
      take: 20, // Limit to 20 most important products
    });
    
    return products.map((product) => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Error generating static params for products:', error);
    // Return empty array to prevent build failures
    return [];
  }
}

// Dynamic metadata generation
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  if (!product) {
    return {
      title: 'Product Not Found | Brief Support',
      description: 'The requested product could not be found.',
    };
  }
  
  return {
    title: `${product.name} | Brief Support`,
    description: product.description?.substring(0, 160) || `Details about ${product.name}`,
    keywords: [product.name, 'product'],
    openGraph: {
      title: product.name,
      description: product.description?.substring(0, 160) || `Details about ${product.name}`,
      images: [
        {
          url: product.image || 'https://ucarecdn.com/fa64c83f-9647-445d-bc47-f576b71f557d/',
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.substring(0, 160) || `Details about ${product.name}`,
      images: [product.image || 'https://ucarecdn.com/fa64c83f-9647-445d-bc47-f576b71f557d/'],
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.image,
            sku: product.id,
            offers: {
              '@type': 'Offer',
              price: product.price ? parseFloat(product.price.toString()) : 0,
              priceCurrency: 'USD',
              availability: product.active 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
            },
            brand: {
              '@type': 'Brand',
              name: product.Domain?.name || 'Brief Support',
            },
          }),
        }}
      />
      
      <Suspense fallback={<ProductDetailSkeleton />}>
        <article className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
                loading="eager"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <nav aria-label="Breadcrumb" className="mb-3">
              <ol className="flex items-center gap-1 text-sm text-gray-500">
                <li>
                  <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                </li>
                <li>
                  <span aria-hidden="true">/</span>
                </li>
                <li className="text-gray-700 font-medium" aria-current="page">
                  {product.name}
                </li>
              </ol>
            </nav>

            <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
            
            <div className="mt-2">
              <p className="text-lg font-semibold">
                {product.price ? formatCurrency(parseFloat(product.price.toString())) : 'Contact for pricing'}
              </p>
            </div>
            
            {product.active ? (
              <div className="flex items-center gap-1 mt-1">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">In Stock</span>
              </div>
            ) : (
              <div className="mt-1 text-sm text-red-500">Currently unavailable</div>
            )}

            <div className="mt-6 prose prose-sm">
              <p>{product.description}</p>
            </div>

            {(product as any).features && Array.isArray((product as any).features) && (
              <div className="mt-6">
                <h2 className="text-lg font-medium mb-3">Features</h2>
                <ul className="list-disc pl-5 space-y-1">
                  {(product as any).features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8">
              <Link
                href={product.active ? `/checkout/${product.id}` : '#'}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium ${
                  product.active 
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {product.active ? 'Add to Cart' : 'Out of Stock'}
              </Link>
            </div>
            
            {product.productUrl && (
              <div className="mt-3">
                <Link
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Visit product website
                </Link>
              </div>
            )}
          </div>
        </article>
      </Suspense>
    </div>
  );
} 