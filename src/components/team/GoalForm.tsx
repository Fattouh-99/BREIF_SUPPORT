'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface GoalFormProps {
  goalType: 'clients' | 'interactions' | 'tickets';
  currentValue: number;
  targetValue: number;
  label: string;
  onSuccess?: (newValue: number) => void;
}

export default function GoalForm({ 
  goalType, 
  currentValue, 
  targetValue, 
  label,
  onSuccess
}: GoalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [target, setTarget] = useState(targetValue);
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
          description: `${label} target updated successfully.`,
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
    <div>
      <div className="flex justify-between mb-2">
        <div className="font-medium text-gray-200">{label}</div>
        <div className="flex items-center gap-3">
          <div className="text-gray-300">Current: {currentValue} / {target}</div>
          
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
              min="1"
              className="w-16 bg-gray-900/50 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200"
            />
            <Button 
              type="submit" 
              variant="link" 
              size="sm" 
              disabled={isSubmitting}
              className="ml-1 text-indigo-400 hover:text-indigo-300"
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </form>
        </div>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 rounded-full" 
          style={{ width: `${Math.min(100, (currentValue / target) * 100)}%` }}
        />
      </div>
    </div>
  );
} 