import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// UUID validation schema
const uuidSchema = z.string().uuid('Invalid user ID format');

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Get user ID from query params
    const url = new URL(request.url); // Get URL from request
    const userId = url.searchParams.get('userId'); // Extract userId from query parameters

    if (!userId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId)) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Validate user ID format (assuming UUID format)
    const userIdValidation = uuidSchema.safeParse(userId);
    if (!userIdValidation.success) {
      return NextResponse.json(
        { error: 'Invalid user ID format', details: 'User ID must be a valid UUID' },
        { status: 400 }
      );
    }
    
    // First check if the user exists in the recruiter_logins table
    const { data: loginData, error: loginError } = await supabase
      .from('recruiter_logins')
      .select('email')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (loginError && loginError.code !== 'PGRST116') { // PGRST116 is "not found"
      return NextResponse.json(
        { error: 'Database error checking user existence', details: loginError.message },
        { status: 500 }
      );
    }
    
    if (!loginData) {
      return NextResponse.json(
        { error: 'Recruiter profile not found', details: 'No recruiter account exists with this user ID' },
        { status: 404 }
      );
    }
    
    // Use Promise.all to fetch both data sets in parallel
    const [basicResult, jobResult] = await Promise.all([
      supabase
        .from('recruiter_basic')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('recruiter_job')
        .select('*')
        .eq('user_id', userId)
        .single()
    ]);
    
    // Handle errors from basic profile query
    if (basicResult.error) {
      if (basicResult.error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Basic profile not found', details: 'Recruiter basic profile information is missing' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch recruiter basic information', details: basicResult.error.message },
        { status: 500 }
      );
    }
    
    // Handle errors from job profile query
    if (jobResult.error) {
      if (jobResult.error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job profile not found', details: 'Recruiter job information is missing' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch recruiter job information', details: jobResult.error.message },
        { status: 500 }
      );
    }
    
    const basicData = basicResult.data;
    const jobData = jobResult.data;
    
    // Check if profile image exists before getting URL
    const { data: imageExists } = await supabase
      .storage
      .from('profile-pictures')
      .list(`recruiter`, {
        limit: 1,
        search: userId
      });
    
    let profileImageUrl = '';
    if (imageExists && imageExists.length > 0) {
      const { data: profileImageData } = await supabase
        .storage
        .from('profile-pictures')
        .getPublicUrl(`recruiter/${userId}`);
      
      profileImageUrl = profileImageData?.publicUrl || '';
    }
    
    // Transform the data to the expected format
    const profileData = {
      userId: basicData.user_id, // Include user ID in the response
      firstName: basicData.first_name,
      lastName: basicData.last_name,
      email: basicData.email,
      phone: basicData.phone || '',
      location: basicData.location || '',
      linkedInUrl: basicData.linkedin_url || '',
      companyName: jobData.company_name,
      jobTitle: jobData.job_title,
      department: jobData.department || '',
      companySize: jobData.company_size || '',
      companyWebsite: jobData.company_website || '',
      companyDescription: jobData.company_description || '',
      profileImageUrl,
      // Add timestamps for client-side caching strategy
      updatedAt: jobData.updated_at || basicData.updated_at || null,
      createdAt: basicData.created_at || null
    };
    
    return NextResponse.json({
      success: true,
      data: profileData
    });
    
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
