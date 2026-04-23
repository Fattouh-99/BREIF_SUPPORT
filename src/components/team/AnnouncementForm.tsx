'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon, Send, Sparkles, Trophy } from 'lucide-react';

export default function AnnouncementForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
    }
  }, [announcement]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!announcement.trim()) {
      toast({
        title: "Empty announcement",
        description: "Please enter an announcement message before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('announcement', announcement);
      
      const response = await fetch('/api/team/announcement', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Team announcement posted successfully. Team members will receive a notification.",
        });
        
        // Clear the form
        setAnnouncement('');
        
        // Refresh the page data without a full reload
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post announcement');
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
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Share an important message with your team..."
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 min-h-[100px] shadow-sm focus:border-blue-300 dark:focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 focus:ring-opacity-50 resize-none transition-all duration-200"
        />
        
        <div className="absolute top-2 right-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 h-8 w-8 flex items-center justify-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-help">
                  <InfoIcon className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-md">
                <p>Your announcement will be visible to all team members on their dashboard and they will receive a notification.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            onClick={() => setAnnouncement(prev => prev + '🎯')}
          >
            🎯
          </button>
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            onClick={() => setAnnouncement(prev => prev + '🚀')}
          >
            🚀
          </button>
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            onClick={() => setAnnouncement(prev => prev + '🏆')}
          >
            🏆
          </button>
        </div>
        
        <Button 
          type="submit"
          disabled={isSubmitting || !announcement.trim()}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white flex items-center gap-2 transition-colors"
        >
          {isSubmitting ? 'Posting...' : (
            <>
              <Send className="h-4 w-4" />
              Post Announcement
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 