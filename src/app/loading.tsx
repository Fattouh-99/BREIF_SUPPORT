'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
} 