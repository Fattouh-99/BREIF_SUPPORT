'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

interface SaveDefaultsButtonProps {
  onSuccess?: () => void;
}

export default function SaveDefaultsButton({ onSuccess }: SaveDefaultsButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const isDarkTheme = theme === 'dark' || resolvedTheme === 'dark';

  const handleSaveDefaults = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/team/goals/save-defaults', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Current goals saved as defaults successfully",
        });
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Refresh server data in the background without a full reload
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save defaults');
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
    <Button 
      type="button" 
      onClick={handleSaveDefaults}
      disabled={isSubmitting}
      variant="outline"
      className={isDarkTheme 
        ? "border-indigo-600/40 text-indigo-400 hover:bg-indigo-900/30 hover:text-indigo-300"
        : "border-indigo-300 text-indigo-600 hover:bg-indigo-50"
      }
    >
      {isSubmitting ? (
        'Saving...'
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Save Current Goals As Defaults
        </>
      )}
    </Button>
  );
} 