'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

export interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src?: string;
  ucareId?: string;
  fadeDuration?: number;
  fallbackIcon?: React.ReactNode;
  containerClassName?: string;
  blurDataURL?: string;
}

export function OptimizedImage({
  ucareId,
  src = '',
  alt,
  className,
  fill = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  quality = 80,
  fadeDuration = 400,
  fallbackIcon,
  containerClassName,
  blurDataURL,
  placeholder = blurDataURL ? 'blur' : undefined,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  useEffect(() => {
    // If ucareId is provided, create the Uploadcare URL
    if (ucareId) {
      setImageSrc(`https://ucarecdn.com/${ucareId}/`);
      setError(false);
    } else if (src) {
      setImageSrc(src);
      setError(false);
    } else {
      // If neither ucareId nor src is provided, set error state
      setError(true);
    }
  }, [ucareId, src]);

  const renderFallbackIcon = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      {fallbackIcon || (
        <ImageIcon className="h-8 w-8 text-gray-400" />
      )}
    </div>
  );

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!error ? (
        imageSrc ? (
          <Image
            src={imageSrc}
            alt={alt || "Image"}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            fill={fill}
            sizes={sizes}
            quality={quality}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoad={() => {
              setTimeout(() => setIsLoaded(true), fadeDuration / 2);
            }}
            onError={() => setError(true)}
            {...props}
          />
        ) : renderFallbackIcon()
      ) : renderFallbackIcon()}
    </div>
  );
} 