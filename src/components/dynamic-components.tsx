'use client';

import dynamic from 'next/dynamic';
import { DynamicImport } from '@/components/ui/dynamic-import';
import React from 'react';

// Carousel component (heavy with Embla)
export const DynamicCarousel = dynamic(
  () => import('@/components/ui/carousel').then(mod => ({
    default: mod.Carousel,
  })),
  { ssr: true }
);

export const DynamicCarouselContent = dynamic(
  () => import('@/components/ui/carousel').then(mod => mod.CarouselContent),
  { ssr: true }
);

export const DynamicCarouselItem = dynamic(
  () => import('@/components/ui/carousel').then(mod => mod.CarouselItem),
  { ssr: true }
);

// Dynamic modals/dialogs (heavy UI components)
export const DynamicDialog = dynamic(
  () => import('@/components/ui/dialog').then(mod => mod.Dialog),
  { ssr: false }
);

// Helper for lazy-loading any component with proper suspense
export function createDynamicComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options = { ssr: true }
) {
  const DynamicComponent = dynamic(importFn, options);
  
  return (props: React.ComponentProps<T>) => (
    <DynamicImport 
      component={React.lazy(() => importFn().then(mod => ({ default: mod.default })))}
      props={props}
    />
  );
} 