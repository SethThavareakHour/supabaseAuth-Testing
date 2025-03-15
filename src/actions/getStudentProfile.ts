import { supabase } from "../utils/supabase/client";


export async function getStudentProfile() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return {
        status: "error",
        message: "You must be logged in to access your profile",
        data: null
      };
    }
    
    const userId = session.user.id;
    
    // First check if the basic profile exists
    const { data: basicProfile, error: basicError } = await supabase
      .from('student_basic')
      .select('*')
      .eq('student_id', userId);
      
    if (basicError) {
      console.error("Error fetching basic profile:", basicError);
      return {
        status: "error",
        message: basicError.message,
        data: null
      };
    }
    

    if (!basicProfile || basicProfile.length === 0) {
      return {
        status: "success",
        message: "No profile found",
        data: null
      };
    }
    
    const profile = basicProfile[0];
  
    const { data: detailProfile, error: detailError } = await supabase
      .from('student_detail')
      .select('*')
      .eq('student_id', userId);
      
    if (!detailError && detailProfile && detailProfile.length > 0) {
      Object.assign(profile, detailProfile[0]);       // Merge the detail data with the basic profile
    }
    
    return {
      status: "success",
      message: "Profile retrieved successfully",
      data: profile
    };
  } catch (error) {
    console.error("Unexpected error in getStudentProfile:", error);
    return {
      status: "error",
      message: "An unexpected error occurred",
      data: null
    };
  }
}