import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const recruiterUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format. Please provide a valid email address'),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedInUrl: z.string().url('LinkedIn URL must be a valid URL format').optional().nullable().or(z.literal('')),
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  companyWebsite: z.string().url('Company website must be a valid URL format').optional().nullable().or(z.literal('')),
  companyDescription: z.string().optional().nullable(),
}).strict();

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to update your profile.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = recruiterUpdateSchema.safeParse(body); // Validate request body
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const profileData = validationResult.data;
    const currentTimestamp = new Date().toISOString();
    
    // Use a transaction to ensure atomicity
    const { error: transactionError } = await supabase.rpc('begin_transaction'); // Begin transaction

    if (transactionError) {
      return NextResponse.json(
        { error: 'Failed to begin transaction', details: transactionError.message },
        { status: 500 }
      );
    }

    try {
      // Update basic profile information
      const { error: basicError } = await supabase
        .from('recruiter_basic')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone || null,
          location: profileData.location || null,
          linkedin_url: profileData.linkedInUrl || null,
          updated_at: currentTimestamp
        })
        .eq('user_id', userId);
      
      if (basicError) {
        throw new Error(`Failed to update basic profile: ${basicError.message}`);
      }
      
      // Update job information
      const { error: jobError } = await supabase
        .from('recruiter_job')
        .update({
          company_name: profileData.companyName,
          job_title: profileData.jobTitle,
          department: profileData.department || null,
          company_size: profileData.companySize || null,
          company_website: profileData.companyWebsite || null,
          company_description: profileData.companyDescription || null,
          updated_at: currentTimestamp
        })
        .eq('user_id', userId);
      
      if (jobError) {
        throw new Error(`Failed to update job information: ${jobError.message}`);
      }
      
      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction');
      if (commitError) {
        throw new Error(`Failed to commit transaction: ${commitError.message}`);
      }
      
      // Fetch the updated profile to return to client
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('recruiter_profiles_view')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (fetchError) {
        return NextResponse.json({
          message: 'Recruiter profile updated successfully',
          userId,
          profileData: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
            location: profileData.location,
            linkedInUrl: profileData.linkedInUrl,
            companyName: profileData.companyName,
            jobTitle: profileData.jobTitle,
            department: profileData.department,
            companySize: profileData.companySize,
            companyWebsite: profileData.companyWebsite,
            companyDescription: profileData.companyDescription,
          }
        });
      }
      
      return NextResponse.json({
        message: 'Recruiter profile updated successfully',
        userId,
        profile: updatedProfile
      });
      
    } catch (error) {
      // Rollback transaction on error
      await supabase.rpc('rollback_transaction');
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error updating recruiter profile:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred while updating your profile' },
      { status: 500 }
    );
  }
}
