import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const recruiterCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedInUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  companySize: z.string().optional(),
  companyWebsite: z.string().url('Invalid company website URL').optional().or(z.literal('')),
  companyDescription: z.string().optional(),
}).strict();

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to create a profile' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = recruiterCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const profileData = validationResult.data;
    
    // Check if email is already in use by another recruiter
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('recruiter_basic')
      .select('user_id')
      .eq('email', profileData.email)
      .neq('user_id', userId)
      .maybeSingle();
    
    if (emailCheckError) {
      return NextResponse.json(
        { error: 'Failed to check email availability', details: emailCheckError.message },
        { status: 500 }
      );
    }
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email is already in use by another recruiter' },
        { status: 409 }
      );
    }
    
    // Begin transaction
    const { error: beginTxError } = await supabase.rpc('begin_transaction');
    if (beginTxError) {
      return NextResponse.json(
        { error: 'Failed to begin transaction', details: beginTxError.message },
        { status: 500 }
      );
    }

    try {
      // Check if recruiter exists in recruiter_logins
      const { data: existingRecruiter, error: checkError } = await supabase
        .from('recruiter_logins')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Database error checking recruiter: ${checkError.message}`);
      }
      
      // If recruiter doesn't exist, create entry in recruiter_logins
      if (!existingRecruiter) {
        const { error: loginError } = await supabase
          .from('recruiter_logins')
          .insert({
            user_id: userId,
            email: profileData.email,
            created_at: new Date().toISOString(),
          });
        
        if (loginError) {
          throw new Error(`Failed to create recruiter login: ${loginError.message}`);
        }
      }
      
      // Check if basic profile already exists
      const { data: existingBasicProfile } = await supabase
        .from('recruiter_basic')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      // Insert or update basic profile information
      const basicOperation = existingBasicProfile 
        ? supabase
            .from('recruiter_basic')
            .update({
              first_name: profileData.firstName,
              last_name: profileData.lastName,
              email: profileData.email,
              phone: profileData.phone || null,
              location: profileData.location || null,
              linkedin_url: profileData.linkedInUrl || null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        : supabase
            .from('recruiter_basic')
            .insert({
              user_id: userId,
              first_name: profileData.firstName,
              last_name: profileData.lastName,
              email: profileData.email,
              phone: profileData.phone || null,
              location: profileData.location || null,
              linkedin_url: profileData.linkedInUrl || null,
            });
      
      const { error: basicError } = await basicOperation;
      
      if (basicError) {
        throw new Error(`Failed to create or update basic profile: ${basicError.message}`);
      }
      
      // Check if job information already exists
      const { data: existingJobInfo } = await supabase
        .from('recruiter_job')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      // Insert or update job information
      const jobOperation = existingJobInfo
        ? supabase
            .from('recruiter_job')
            .update({
              company_name: profileData.companyName,
              job_title: profileData.jobTitle,
              department: profileData.department || null,
              company_size: profileData.companySize || null,
              company_website: profileData.companyWebsite || null,
              company_description: profileData.companyDescription || null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        : supabase
            .from('recruiter_job')
            .insert({
              user_id: userId,
              company_name: profileData.companyName,
              job_title: profileData.jobTitle,
              department: profileData.department || null,
              company_size: profileData.companySize || null,
              company_website: profileData.companyWebsite || null,
              company_description: profileData.companyDescription || null,
            });
      
      const { error: jobError } = await jobOperation;
      
      if (jobError) {
        throw new Error(`Failed to create or update job information: ${jobError.message}`);
      }
      
      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction');
      if (commitError) {
        throw new Error(`Failed to commit transaction: ${commitError.message}`);
      }
      
      // Fetch the complete profile to return
      const { data: basicProfile } = await supabase
        .from('recruiter_basic')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const { data: jobProfile } = await supabase
        .from('recruiter_job')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return NextResponse.json({
        message: 'Recruiter profile created or updated successfully',
        userId,
        profile: {
          ...basicProfile,
          ...jobProfile
        }
      });
      
    } catch (txError) {
      // Rollback transaction on error
      await supabase.rpc('rollback_transaction');
      
      return NextResponse.json(
        { error: txError instanceof Error ? txError.message : 'Transaction failed' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error creating recruiter profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}