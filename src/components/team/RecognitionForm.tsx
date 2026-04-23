'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Award, Trophy, Send, Star } from 'lucide-react';

export default function RecognitionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
    }
  }, [message]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a recognition message before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('recognition_message', message);
      
      const response = await fetch('/api/team/recognition', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Team recognition message posted successfully.",
        });
        
        // Clear the form
        setMessage('');
        
        // Refresh the page data without a full reload
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post recognition message');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Recognize a team member or the entire team for their outstanding achievements..."
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 min-h-[100px] shadow-sm focus:border-purple-300 dark:focus:border-purple-500 focus:ring focus:ring-purple-200 dark:focus:ring-purple-700 focus:ring-opacity-50 resize-none transition-all duration-200"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
            onClick={() => setMessage(prev => prev + '🏆')}
          >
            🏆
          </button>
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
            onClick={() => setMessage(prev => prev + '⭐')}
          >
            ⭐
          </button>
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
            onClick={() => setMessage(prev => prev + '👏')}
          >
            👏
          </button>
        </div>
        
        <Button 
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white flex items-center gap-2 transition-colors"
        >
          {isSubmitting ? 'Posting...' : (
            <>
              <Trophy className="h-4 w-4" />
              Post Recognition
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 