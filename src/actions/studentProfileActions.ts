"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserSession } from "@/actions/auth";

// Type definition for student profile aligned with the database schema
export type StudentProfile = {
  id?: string;
  student_id?: string;
  graduation_type?: string;
  school_name?: string;
  enrollment_date?: string;
  graduation_date?: string;
  major?: string;
  native_language?: string;
  skills?: string;
  work_experience?: string;
  self_promotion?: string;
  technical_promotion?: string;
  additional_info?: string;
  firstname?: string;
  lastname?: string;
  education?: string;
  email?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  created_at?: string;
  updated_at?: string;
};

// Create a new student profile
export async function createStudentProfile(formData: StudentProfile) {
  const session = await getUserSession();
  if (!session || !session.user) {
    return { status: "error", message: "Not authenticated" };
  }

  // Check if user role is student
  if (session.user.user_metadata?.role !== "student") {
    return {
      status: "error",
      message: "Only students can create a student profile",
    };
  }

  const supabase = await createClient();

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("student_detail")
    .select("*")
    .eq("student_id", session.user.id)
    .single();

  if (existingProfile) {
    return {
      status: "error",
      message: "Profile already exists. Use update instead.",
    };
  }

  // Prepare data from form - now matched to database schema
  const profileData = {
    student_id: session.user.id,
    graduation_type: formData.graduation_type,
    school_name: formData.school_name,
    enrollment_date: formData.enrollment_date,
    graduation_date: formData.graduation_date,
    major: formData.major,
    native_language: formData.native_language,
    skills: formData.skills,
    work_experience: formData.work_experience,
    self_promotion: formData.self_promotion,
    technical_promotion: formData.technical_promotion,
    additional_info: formData.additional_info,
    firstname: formData.firstname,
    lastname: formData.lastname,
    education: formData.education,
    email: session.user.email,
    resume_url: formData.resume_url,
  };

  const { data, error } = await supabase
    .from("student_detail")
    .insert(profileData);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/profile");
  return { status: "success", data };
}

// Get student profile
export async function getStudentProfile(userId?: string) {
  const supabase = await createClient();
  let queryUserId = userId;

  // If no userId provided, get current user's profile
  if (!queryUserId) {
    const session = await getUserSession();
    if (!session || !session.user) {
      return { status: "error", message: "Not authenticated" };
    }
    queryUserId = session.user.id;
  }

  // Query student_detail table first
  const { data: detailData, error: detailError } = await supabase
    .from("student_detail")
    .select("*")
    .eq("student_id", queryUserId);

  if (detailError) {
    return { status: "error", message: detailError.message };
  }

  // Handle case where no profile exists
  if (!detailData || detailData.length === 0) {
    return {
      status: "success",
      message: "No profile found",
      data: null,
    };
  }

  // Try to get basic data as well to merge them
  const { data: basicData, error: basicError } = await supabase
    .from("student_basic")
    .select("*")
    .eq("student_id", queryUserId);

  let profileData = detailData[0];

  // If basic data exists, merge it with the detail data
  if (!basicError && basicData && basicData.length > 0) {
    profileData = { ...basicData[0], ...profileData };
  }

  return { status: "success", data: profileData };
}

// Get all student profiles (for recruiters or admin)
export async function getAllStudentProfiles(
  options = { limit: 20, offset: 0 }
) {
  const supabase = await createClient();
  const session = await getUserSession();

  if (!session || !session.user) {
    return { status: "error", message: "Not authenticated" };
  }

  // Check if user is a recruiter or admin
  if (
    session.user.user_metadata?.role !== "recruiter" &&
    session.user.user_metadata?.role !== "admin"
  ) {
    return { status: "error", message: "Unauthorized to view all profiles" };
  }

  const { data, error, count } = await supabase
    .from("student_detail")
    .select("*", { count: "exact" })
    .range(options.offset, options.offset + options.limit - 1);

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "success", data, count };
}

// Update student profile
export async function updateStudentProfile(formData: FormData) {
  const session = await getUserSession();
  if (!session || !session.user) {
    return { status: "error", message: "Not authenticated" };
  }

  const supabase = await createClient();

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("student_detail")
    .select("*")
    .eq("student_id", session.user.id)
    .single();

  if (!existingProfile) {
    return {
      status: "error",
      message: "Profile doesn't exist. Create one first.",
    };
  }

  // Prepare data from form - now matched to database schema
  const profileData: Partial<StudentProfile> = {};

  // Only update fields that were provided in the form
  if (formData.get("firstname"))
    profileData.firstname = formData.get("firstname") as string;
  if (formData.get("lastname"))
    profileData.lastname = formData.get("lastname") as string;
  if (formData.get("graduation_type"))
    profileData.graduation_type = formData.get("graduation_type") as string;
  if (formData.get("school_name"))
    profileData.school_name = formData.get("school_name") as string;
  if (formData.get("enrollment_date"))
    profileData.enrollment_date = formData.get("enrollment_date") as string;
  if (formData.get("graduation_date"))
    profileData.graduation_date = formData.get("graduation_date") as string;
  if (formData.get("major"))
    profileData.major = formData.get("major") as string;
  if (formData.get("native_language"))
    profileData.native_language = formData.get("native_language") as string;
  if (formData.get("skills"))
    profileData.skills = formData.get("skills") as string;
  if (formData.get("work_experience"))
    profileData.work_experience = formData.get("work_experience") as string;
  if (formData.get("self_promotion"))
    profileData.self_promotion = formData.get("self_promotion") as string;
  if (formData.get("technical_promotion"))
    profileData.technical_promotion = formData.get(
      "technical_promotion"
    ) as string;
  if (formData.get("additional_info"))
    profileData.additional_info = formData.get("additional_info") as string;
  if (formData.get("education"))
    profileData.education = formData.get("education") as string;
  if (formData.get("resume_url"))
    profileData.resume_url = formData.get("resume_url") as string;

  const { data, error } = await supabase
    .from("student_detail") // Corrected table name
    .update(profileData)
    .eq("student_id", session.user.id)
    .select()
    .single();

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/profile");
  return { status: "success", data };
}

// Delete student profile
export async function deleteStudentProfile(userId: string) {
  const session = await getUserSession();
  if (!session || !session.user) {
    return { status: "error", message: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("student_detail")
    .delete()
    .eq("student_id", session.user.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/profile");
  return { status: "success" };
}

// Upload resume to storage and update profile
export async function uploadResume(file: File) {
  const session = await getUserSession();
  if (!session || !session.user) {
    return { status: "error", message: "Not authenticated" };
  }

  const supabase = await createClient();

  // Upload file to storage
  const fileName = `${session.user.id}-${Date.now()}`;
  const { data: fileData, error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(fileName, file);

  if (uploadError) {
    return { status: "error", message: uploadError.message };
  }

  // Get public URL
  const { data: publicURLData } = supabase.storage
    .from("resumes")
    .getPublicUrl(fileName);

  // Update profile with resume URL
  const { error: updateError } = await supabase
    .from("student_detail")
    .update({ resume_url: publicURLData.publicUrl })
    .eq("student_id", session.user.id);

  if (updateError) {
    return { status: "error", message: updateError.message };
  }

  revalidatePath("/profile");
  return { status: "success", url: publicURLData.publicUrl };
}

// Search student profiles by skills, education, etc.
export async function searchStudentProfiles(searchParams: {
  skills?: string;
  education?: string;
  keywords?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  const session = await getUserSession();

  if (!session || !session.user) {
    return { status: "error", message: "Not authenticated" };
  }

  // Check if user is a recruiter or admin
  if (
    session.user.user_metadata?.role !== "recruiter" &&
    session.user.user_metadata?.role !== "admin"
  ) {
    return { status: "error", message: "Unauthorized to search profiles" };
  }

  let query = supabase.from("student_detail").select("*", { count: "exact" });

  // Apply filters if provided
  if (searchParams.skills) {
    query = query.ilike("skills", `%${searchParams.skills}%`);
  }

  if (searchParams.education) {
    query = query.ilike("education", `%${searchParams.education}%`);
  }

  if (searchParams.keywords) {
    // Full text search across multiple fields
    query = query.or(
      `self_promotion.ilike.%${searchParams.keywords}%,firstname.ilike.%${searchParams.keywords}%,lastname.ilike.%${searchParams.keywords}%`
    );
  }

  // Apply pagination
  const limit = searchParams.limit || 20;
  const offset = searchParams.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "success", data, count };
}
