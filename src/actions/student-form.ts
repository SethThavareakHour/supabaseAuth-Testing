"use server"

import { createClient } from "@/utils/supabase/server";
import { getUserSession } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export type BasicForm = {
    student_id? : string;
    date_of_birth?: string;
    country?: string;
    phone_number?: string;
    address?: string;
    postal_code?: string;
}

export type DetailForm = {
    student_id?: string;
    school_name?: string;
    major?: string;
    skills?: string;
    enrollment_date?: string;
    graduation_date?: string;
    graduation_type?: string;
    native_language?: string;
    self_promotion?: string;
    technical_promotion?: string;
    additional_info?: string;
}

export async function studentBasicForm (formdata: BasicForm) {
    const supabase = await createClient();
    const session = await getUserSession();
    if (!session || !session.user) {
        return { status: "error", message : "Not authenticated" };
    }

    if (session.user.user_metadata?.accountType !== "student") {
        return { 
            status: "error",
            message: "Only student can create student profile",
        };
    }

    const basicData = {
        student_id: session.user.id,
        date_of_birth: formdata.date_of_birth,
        country: formdata.country,
        phone_number: formdata.phone_number,
        address: formdata.address,
        postal_code: formdata.postal_code,
        firstName: session.user.user_metadata?.firstName || "",
        lastName: session.user.user_metadata?.lastName || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // check if data already exist
    const {  data: existingForm } = await supabase
    .from("student_basic")
    .select("*")
    .eq("student_id", session.user.id)
    .maybeSingle();

    if (existingForm) {
        return {
            status: "error",
            message : "Form already filed. Use update instead"
        }
    }
    
    const { data, error } = await supabase
    .from("student_basic")
    .insert(basicData)

    if (error) {
        return { status: "error", message: error.message };
    }
    
    revalidatePath("/profile");
    return { status: "success", data };
}

export async function studentDetailForm (formdata: DetailForm) {
    const supabase = await createClient();
    const session = await getUserSession();
    
    if (!session || !session.user) {
        return { status: "error", message : "Not authenticated" };
    }

    if (session.user.user_metadata?.accountType !== "student") {
        return { 
            status: "error",
            message: "Only student can create student profile",
        };
    }

    const detailData = {
        student_id: session.user.id,
        school_name: formdata.school_name,
        major: formdata.major,
        skills: formdata.skills,
        enrollment_date: formdata.enrollment_date,
        graduation_date: formdata.graduation_date,
        graduation_type: formdata.graduation_type,
        native_language: formdata.native_language,
        self_promotion: formdata.self_promotion,
        technical_promotion: formdata.technical_promotion,
        additional_info: formdata.additional_info,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

        // check if data already exist
    const {  data: existingForm } = await supabase
    .from("student_detail")
    .select("*")
    .eq("student_id", session.user.id)
    .maybeSingle();
    
    if (existingForm) {
        return {
            status: "error",
            message : "Form already filed. Use update instead"
        }
    }
        
    const { data, error } = await supabase
    .from("student_detail")
    .insert(detailData)
    
    if (error) {
        return { status: "error", message: error.message };
    }
        
    revalidatePath("/profile");
    return { status: "success", data };
}

export async function updateForm(basicData?: BasicForm, detailData?: DetailForm) {
    const supabase = await createClient();
    const session = await getUserSession();
    
    if (!session || !session.user) {
        return { status: "error", message: "Not authenticated" };
    }

    if (session.user.user_metadata?.accountType !== "student") {
        return { 
            status: "error",
            message: "Only students can update their profile",
        };
    }

    const studentId = session.user.id;
    let basicResult, detailResult;

    // Update basic info if provided
    if (basicData) {
        const basicUpdateData = {
            date_of_birth: basicData.date_of_birth,
            country: basicData.country,
            phone_number: basicData.phone_number,
            address: basicData.address,
            postal_code: basicData.postal_code,
            updatedAt: new Date().toISOString(),
        };
        
        const { data, error } = await supabase
            .from("student_basic")
            .update(basicUpdateData)
            .eq("student_id", studentId)
            .select();
        
        if (error) {
            return { status: "error", message: `Error updating basic info: ${error.message}` };
        }
        
        basicResult = data;
    }
    
    // Update detail info if provided
    if (detailData) {
        const detailUpdateData = {
            school_name: detailData.school_name,
            major: detailData.major,
            skills: detailData.skills,
            enrollment_date: detailData.enrollment_date,
            graduation_date: detailData.graduation_date,
            graduation_type: detailData.graduation_type,
            native_language: detailData.native_language,
            self_promotion: detailData.self_promotion,
            technical_promotion: detailData.technical_promotion,
            additional_info: detailData.additional_info,
            updatedAt: new Date().toISOString(),
        };
        
        const { data, error } = await supabase
            .from("student_detail")
            .update(detailUpdateData)
            .eq("student_id", studentId)
            .select();
        
        if (error) {
            return { status: "error", message: `Error updating detailed info: ${error.message}` };
        }
        
        detailResult = data;
    }
    
    revalidatePath("/profile");
    return { 
        status: "success", 
        message: "Profile updated successfully",
        basicData: basicResult,
        detailData: detailResult
    };
}

export async function getStudentProfile() {
    const supabase = await createClient();
    const session = await getUserSession();
    
    if (!session || !session.user) {
        return { status: "error", message: "Not authenticated" };
    }
    
    const studentId = session.user.id;
    
    // Fetch basic data
    const { data: basicData, error: basicError } = await supabase
        .from("student_basic")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle();
    
    if (basicError) {
        return { status: "error", message: `Error fetching basic info: ${basicError.message}` };
    }
    
    // Fetch detail data
    const { data: detailData, error: detailError } = await supabase
        .from("student_detail")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle();
    
    if (detailError) {
        return { status: "error", message: `Error fetching detailed info: ${detailError.message}` };
    }
    
    return {
        status: "success",
        basicData,
        detailData
    };
}