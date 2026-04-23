import { NextRequest, NextResponse } from 'next/server';
import { onCompleteUserRegistration } from '@/actions/auth';
import { UserRole } from '@prisma/client';
import { validateUserData } from '@/lib/validation-utils';

// Define standard JSON headers
const jsonHeaders = {
  'Content-Type': 'application/json'
};

export async function POST(req: NextRequest) {
  // Ensure we're always returning JSON, even on errors
  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers: jsonHeaders }
      );
    }
    
    // Extract required fields
    const {
      fullname,
      clerkId,
      role,
      products,
      categories,
      targetAudience,
      // dashboard preference removed
      imageUrl,
      email,
      selectedPlan,
      teamId
    } = requestBody;

    // Validate the user data
    const validation = validateUserData({
      fullname,
      clerkId,
      email,
      role,
      products,
      categories
    });

    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return NextResponse.json(
        { 
          error: 'Invalid user data', 
          validationErrors: validation.errors 
        },
        { status: 400, headers: jsonHeaders }
      );
    }

    console.log('Completing registration via API for:', { 
      clerkId, 
      email, 
      role: validation.validatedData.role, 
      selectedPlan,
      teamId: teamId || 'none'
    });
    
    try {
      // Call server action with validated data
      const result = await onCompleteUserRegistration(
        validation.validatedData.fullname,
        validation.validatedData.clerkId,
        validation.validatedData.role,
        validation.validatedData.products,
        validation.validatedData.categories,
        targetAudience || null,
        imageUrl,
        validation.validatedData.email,
        selectedPlan || 'starter',
        undefined, // stripeId
        teamId // Pass the teamId
      );
      
      console.log('Server action response:', JSON.stringify(result));
      
      // Handle success case
      if (result.status === 200 && result.user) {
        return NextResponse.json({
          success: true,
          user: result.user
        }, { headers: jsonHeaders });
      } 
      
      // Handle server action errors
      console.error('Server action failed:', result);
      return NextResponse.json(
        { 
          error: result.error || 'Failed to complete registration',
          details: result 
        },
        { status: 500, headers: jsonHeaders }
      );
    } catch (actionError) {
      // Catch any errors from the server action
      console.error('Server action exception:', actionError);
      return NextResponse.json(
        { 
          error: actionError instanceof Error ? actionError.message : 'Server action failed',
          type: 'action_error'
        },
        { status: 500, headers: jsonHeaders }
      );
    }
  } catch (error) {
    // Final catch-all error handler
    console.error('API error during registration completion:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'api_error'
      },
      { status: 500, headers: jsonHeaders }
    );
  }
} 