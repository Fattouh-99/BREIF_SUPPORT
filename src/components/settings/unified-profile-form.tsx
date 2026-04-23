'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { useToast } from '@/components/ui/use-toast'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Shield } from 'lucide-react'
import { onUpdateFullName, onUpdateEmail, onUpdatePassword } from '@/actions/settings'
import { useUserProfile } from '@/hooks/settings/use-settings'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email').optional(),
  confirmEmail: z.string().email('Please enter a valid email').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine(data => !data.email || data.email === data.confirmEmail, {
  message: 'Email addresses must match',
  path: ['confirmEmail'],
}).refine(data => !data.newPassword || data.newPassword === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
}).refine(data => {
  // At least one field should be filled
  return !!data.fullName || !!data.email || !!data.newPassword;
}, {
  message: 'At least one field must be provided',
  path: ['fullName'],
}).refine(data => {
  // Current password is required when changing password
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required when changing password',
  path: ['currentPassword'],
});

export function UnifiedProfileForm() {
  const { profileData, loading: profileLoading, error: profileError, refreshProfile } = useUserProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<'name' | 'email' | 'password' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<z.infer<typeof profileSchema> | null>(null);

  const { 
    register, 
    handleSubmit, 
    reset,
    watch,
    formState: { errors } 
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      confirmEmail: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const watchEmail = watch('email');
  const watchPassword = watch('newPassword');
  
  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    // For sensitive operations (email or password change), show confirmation dialog
    if (data.email || data.newPassword) {
      setPendingData(data);
      setShowConfirmDialog(true);
      return;
    }
    
    // For name change only, proceed directly
    await processUpdate(data);
  };
  
  const processUpdate = async (data: z.infer<typeof profileSchema>) => {
    setLoading(true);
    
    try {
      // Update name if provided
      if (data.fullName) {
        const nameResult = await onUpdateFullName(data.fullName);
        if (!nameResult?.success) {
          throw new Error(nameResult?.error || 'Failed to update name');
        }
      }
      
      // Update email if provided
      if (data.email && data.confirmEmail && data.email === data.confirmEmail) {
        const emailResult = await onUpdateEmail(data.email);
        if (!emailResult?.success) {
          throw new Error(emailResult?.error || 'Failed to update email');
        }
      }
      
      // Update password if provided
      if (data.currentPassword && data.newPassword && data.confirmPassword) {
        const passwordResult = await onUpdatePassword(data.newPassword);
        if (!passwordResult?.success) {
          throw new Error(passwordResult?.error || 'Failed to update password');
        }
      }

      // Success - refresh the profile data from database
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
        variant: "default",
      });
      
      reset();
      setSection(null);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPendingData(null);
    }
  };
  
  const getConfirmationMessage = () => {
    if (pendingData?.email && pendingData?.newPassword) {
      return "You're about to change both your email address and password. After this change, you'll need to use your new credentials to sign in.";
    } else if (pendingData?.email) {
      return `You're about to change your email address to ${pendingData.email}. You'll need to use this new email to sign in.`;
    } else if (pendingData?.newPassword) {
      return "You're about to change your password. After this change, you'll need to use your new password to sign in.";
    }
    return "Are you sure you want to make these changes?";
  };

  // Show loading state while fetching profile data
  if (profileLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading profile...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if profile failed to load
  if (profileError) {
    return (
      <Card className="border-red-200 dark:border-red-700 shadow-sm bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-500 dark:text-red-400">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Failed to load profile: {profileError}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Personal Information</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Update your personal information securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="fullName" className="text-base font-medium">
                  Full Name
                </Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSection(section === 'name' ? null : 'name')}
                >
                  {section === 'name' ? 'Cancel' : 'Change'}
                </Button>
              </div>
              
              {section !== 'name' ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {profileData?.fullname || "Not set"}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    {...register('fullName')}
                    className="bg-white dark:bg-slate-900"
                  />
                  {errors.fullName && (
                    <div className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.fullName.message}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Email Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSection(section === 'email' ? null : 'email')}
                >
                  {section === 'email' ? 'Cancel' : 'Change'}
                </Button>
              </div>
              
              {section !== 'email' ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {profileData?.email || "Not set"}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter new email address"
                      {...register('email')}
                      className="bg-white dark:bg-slate-900"
                    />
                    {errors.email && (
                      <div className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email.message}
                      </div>
                    )}
                  </div>
                  
                  {watchEmail && (
                    <div className="space-y-2">
                      <Input
                        id="confirmEmail"
                        type="email"
                        placeholder="Confirm new email address"
                        {...register('confirmEmail')}
                        className="bg-white dark:bg-slate-900"
                      />
                      {errors.confirmEmail && (
                        <div className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.confirmEmail.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Password Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Label htmlFor="currentPassword" className="text-base font-medium">
                  Password
                </Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSection(section === 'password' ? null : 'password')}
                >
                  {section === 'password' ? 'Cancel' : 'Change'}
                </Button>
              </div>
              
              {section !== 'password' ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ••••••••
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Current password"
                      {...register('currentPassword')}
                      className="bg-white dark:bg-slate-900"
                    />
                    {errors.currentPassword && (
                      <div className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.currentPassword.message}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="New password"
                      {...register('newPassword')}
                      className="bg-white dark:bg-slate-900"
                    />
                    {errors.newPassword && (
                      <div className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.newPassword.message}
                      </div>
                    )}
                  </div>
                  
                  {watchPassword && (
                    <div className="space-y-2">
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        {...register('confirmPassword')}
                        className="bg-white dark:bg-slate-900"
                      />
                      {errors.confirmPassword && (
                        <div className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.confirmPassword.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Submit Button - only show if a section is active */}
            {section && (
              <Button 
                type="submit" 
                className="w-full bg-indigo-500 text-white font-semibold hover:bg-indigo-600"
                disabled={loading}
              >
                <Loader loading={loading}>
                  Save Changes
                </Loader>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Shield className="h-5 w-5 text-indigo-500" />
              Confirm Security Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 dark:border-gray-600 dark:text-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-indigo-500 text-white hover:bg-indigo-600"
              onClick={() => pendingData && processUpdate(pendingData)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 