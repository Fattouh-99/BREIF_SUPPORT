'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Define a simple loading component
const ChatWindowLoading = () => (
  <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 animate-pulse">
    <div className="p-4 border-b h-16 bg-gray-200 rounded-md"></div>
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`w-64 h-16 rounded-lg ${i % 2 === 0 ? 'bg-blue-200' : 'bg-gray-200'}`}></div>
        </div>
      ))}
    </div>
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
        <div className="w-20 h-10 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  </div>
);

// Dynamically import the ChatWindow component
const DynamicChatWindow = dynamic(
  () => import('./chat-window'),
  {
    loading: () => <ChatWindowLoading />,
    ssr: false // Disable server-side rendering for this component
  }
);

// Create a type-safe props interface that matches the original component
type ChatWindowProps = {
  className?: string;
};

// Export a wrapper component
export default function ChatWindowWrapper(props: ChatWindowProps) {
  return (
    <Suspense fallback={<ChatWindowLoading />}>
      <DynamicChatWindow {...props} />
    </Suspense>
  );
} 