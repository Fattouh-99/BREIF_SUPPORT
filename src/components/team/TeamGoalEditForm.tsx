'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface TeamGoalEditFormProps {
  goalType: 'clients' | 'interactions' | 'tickets';
  defaultValue: number;
  onSuccess?: (newValue: number) => void;
  isDarkTheme?: boolean;
}

export default function TeamGoalEditForm({ 
  goalType, 
  defaultValue,
  onSuccess,
  isDarkTheme = false
}: TeamGoalEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [target, setTarget] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (target < 1) {
      toast({
        title: "Invalid goal",
        description: "Please enter a target value greater than 0.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('goal_type', goalType);
      formData.append('target', target.toString());
      
      const response = await fetch('/api/team/goals', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: `Goal target updated successfully.`,
        });
        
        // Call the onSuccess callback to update the parent component's state
        if (onSuccess) {
          onSuccess(target);
        }
        
        // Refresh server data in the background without a full reload
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update goal');
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
    <form onSubmit={handleSubmit} className="flex items-center">
      <input
        type="number"
        value={target}
        onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
        min="1"
        className={`w-16 rounded px-2 py-1 text-sm ${
          isDarkTheme 
            ? "bg-indigo-700/50 border border-indigo-600/30 text-white" 
            : "bg-white border border-indigo-200 text-indigo-900"
        }`}
      />
      <Button 
        type="submit" 
        variant="link" 
        size="sm" 
        disabled={isSubmitting}
        className={`ml-1 ${
          isDarkTheme 
            ? "text-indigo-400 hover:text-indigo-300" 
            : "text-indigo-600 hover:text-indigo-700"
        }`}
      >
        {isSubmitting ? '...' : 'Set'}
      </Button>
    </form>
  );
} 