"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserSession } from "@/actions/auth"; // Assuming this is the path to your existing auth actions
// Type definition for student profile
export type StudentProfile = {
  id?: string;
  user_id?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  bio?: string;
  education?: string[];
  skills?: string[];
  experience?: string[];
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
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
  console.log("Form Data", formData);
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
    .from("student_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (existingProfile) {
    return {
      status: "error_1",
      message: "Profile already exists. Use update instead.",
    };
  }

  // Prepare data from form
  const profileData = {
    student_id: session.user.id,
    email: session.user.email,
    firstname: formData.firstname,
    lastname: formData.lastname,
    bio: formData.bio,
    education: formData.education,
    skills: formData.skills,
    experience: formData.experience,
    portfolio_url: formData.portfolio_url,
    linkedin_url: formData.linkedin_url,
    github_url: formData.github_url,
    resume_url: formData.resume_url,
  };
  console.log("Profile Data", profileData);
  const { data, error } = await supabase
    .from("student_basic")
    .insert(profileData);
  // .select()
  // .single();
  console.log(error);
  if (error) {
    return { status: "error_2", message: error.message };
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

  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", queryUserId)
    .single();

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "success", data };
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
    .from("student_profiles")
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
    .from("student_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (!existingProfile) {
    return {
      status: "error",
      message: "Profile doesn't exist. Create one first.",
    };
  }

  // Prepare data from form
  const profileData: Partial<StudentProfile> = {};

  // Only update fields that were provided in the form
  if (formData.get("firstname"))
    profileData.firstname = formData.get("firstname") as string;
  if (formData.get("lastname"))
    profileData.lastname = formData.get("lastname") as string;
  if (formData.get("bio")) profileData.bio = formData.get("bio") as string;
  if (formData.get("education"))
    profileData.education = JSON.parse(formData.get("education") as string);
  if (formData.get("skills"))
    profileData.skills = JSON.parse(formData.get("skills") as string);
  if (formData.get("experience"))
    profileData.experience = JSON.parse(formData.get("experience") as string);
  if (formData.get("portfolio_url"))
    profileData.portfolio_url = formData.get("portfolio_url") as string;
  if (formData.get("linkedin_url"))
    profileData.linkedin_url = formData.get("linkedin_url") as string;
  if (formData.get("github_url"))
    profileData.github_url = formData.get("github_url") as string;
  if (formData.get("resume_url"))
    profileData.resume_url = formData.get("resume_url") as string;

  const { data, error } = await supabase
    .from("student_profiles")
    .update(profileData)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/profile");
  return { status: "success", data };
}

// Delete student profile
export async function deleteStudentProfile() {
  const session = await getUserSession();
  if (!session || !session.user) {
    return { status: "error", message: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("student_profiles")
    .delete()
    .eq("user_id", session.user.id);

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
    return { status: "error, file_loading", message: uploadError.message };
  }

  // Get public URL
  const { data: publicURLData } = supabase.storage
    .from("resumes")
    .getPublicUrl(fileName);

  // Update profile with resume URL
  const { error: updateError } = await supabase
    .from("student_profiles")
    .update({ resume_url: publicURLData.publicUrl })
    .eq("user_id", session.user.id);

  if (updateError) {
    return { status: "error", message: updateError.message };
  }

  revalidatePath("/profile");
  return { status: "success", url: publicURLData.publicUrl };
}

// Search student profiles by skills, education, etc.
export async function searchStudentProfiles(searchParams: {
  skills?: string[];
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

  let query = supabase.from("student_profiles").select("*", { count: "exact" });

  // Apply filters if provided
  if (searchParams.skills && searchParams.skills.length > 0) {
    // Overlap operator for array fields
    query = query.overlaps("skills", searchParams.skills);
  }

  if (searchParams.education) {
    // Contains operator for array fields (education is array of objects typically)
    query = query.textSearch("education", searchParams.education);
  }

  if (searchParams.keywords) {
    // Full text search across multiple fields
    query = query.or(
      `bio.ilike.%${searchParams.keywords}%,firstname.ilike.%${searchParams.keywords}%,lastname.ilike.%${searchParams.keywords}%`
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
