import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to delete your profile.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Log the deletion process for audit purposes
    console.log(`Profile deletion initiated for user ID: ${userId}`);
    
    // Delete job information first (foreign key constraint)
    const { error: jobError } = await supabase
      .from('recruiter_job')
      .delete()
      .eq('user_id', userId);
    
    if (jobError) {
      console.error(`Failed to delete job information for user ${userId}:`, jobError);
      return NextResponse.json(
        { 
          error: 'Failed to delete job information', 
          details: jobError.message,
          hint: 'Database constraints may be preventing deletion. Please contact support.'
        },
        { status: 500 }
      );
    }
    
    // Delete basic profile information
    const { error: basicError } = await supabase
      .from('recruiter_basic')
      .delete()
      .eq('user_id', userId);
    
    if (basicError) {
      console.error(`Failed to delete basic profile for user ${userId}:`, basicError);
      return NextResponse.json(
        { 
          error: 'Failed to delete basic profile', 
          details: basicError.message,
          hint: 'Your job information was deleted, but we couldn\'t remove your basic profile. Please try again or contact support.'
        },
        { status: 500 }
      );
    }
    
    // Check if profile picture exists before attempting to delete it
    const { data: fileList } = await supabase
      .storage
      .from('profile-pictures')
      .list(`recruiter/${userId}`);
    
    if (fileList && fileList.length > 0) {
      // Profile picture exists, delete it
      const { error: storageError } = await supabase
        .storage
        .from('profile-pictures')
        .remove([`recruiter/${userId}`]);
      
      if (storageError) {
        console.warn(`Failed to delete profile picture for user ${userId}:`, storageError);
        // Continue with deletion process - profile picture deletion is not critical
      }
    }
    
    // Delete from recruiter_logins
    const { error: loginError } = await supabase
      .from('recruiter_logins')
      .delete()
      .eq('user_id', userId);
    
    if (loginError) {
      console.error(`Failed to delete recruiter login for user ${userId}:`, loginError);
      return NextResponse.json(
        { 
          error: 'Failed to delete recruiter login record', 
          details: loginError.message,
          hint: 'Your profile data was deleted, but we couldn\'t remove your login information. Please contact support.'
        },
        { status: 500 }
      );
    }
    
    console.log(`Profile deletion completed successfully for user ID: ${userId}`);
    
    return NextResponse.json({
      message: 'Recruiter profile deleted successfully',
      userId,
      deletedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error deleting recruiter profile:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error occurred while deleting your profile',
        hint: 'Please try again later or contact support if the issue persists.'
      },
      { status: 500 }
    );
  }
}