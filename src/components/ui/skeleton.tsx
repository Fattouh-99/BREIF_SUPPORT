'use client';

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
      {...props}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[180px] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-1/4" />
    </div>
  )
}

export function ProductTableRowSkeleton() {
  return (
    <div className="flex items-center p-4 border-b border-gray-100 animate-pulse">
      <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="w-20 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="w-24 flex justify-end space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

export function ProductFormSkeleton() {
  return (
    <div className="max-h-[80vh] overflow-y-auto px-4 animate-pulse">
      <div className="mt-3 w-full flex flex-col gap-5 py-10">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="flex flex-wrap gap-2">
            <div className="h-20 w-20 bg-gray-200 rounded-lg" />
            <div className="h-20 w-20 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="flex flex-wrap gap-2">
            <div className="h-16 w-16 bg-gray-200 rounded-lg" />
            <div className="h-16 w-16 bg-gray-200 rounded-lg" />
            <div className="h-16 w-16 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-1/4 mt-4" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Skeleton className="h-[400px] w-full rounded-xl" />
      <div className="flex flex-col space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-1/3 mt-4" />
      </div>
    </div>
  )
}
