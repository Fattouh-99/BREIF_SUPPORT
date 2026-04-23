'use client';

import React from 'react';

export default function ErrorRefresh() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="max-w-md p-6 bg-card rounded-lg shadow-sm border border-border/50 text-center">
        <h2 className="text-xl font-semibold mb-2">Could not load conversation</h2>
        <p className="text-muted-foreground mb-4">
          There was an error loading the conversation data. Please try refreshing the page.
        </p>
        <button 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
} 