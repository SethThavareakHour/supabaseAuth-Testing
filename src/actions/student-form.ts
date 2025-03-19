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

export async function studentBasicForm (formData: BasicForm) {
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
        date_of_birth: formData.date_of_birth,
        country: formData.country,
        phone_number: formData.phone_number,
        address: formData.address,
        postal_code: formData.postal_code,
        firstName: session.user.user_metadata?.firstName || "",
        lastName: session.user.user_metadata?.lastName || "",
        createdAt: new Date().toISOString(),
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