import { createClient } from "@supabase/supabase-js"; // Ensure correct import path

const supabase = createClient(
  "//tmguvdxsgqdnkgiyhalt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZ3V2ZHhzZ3FkbmtnaXloYWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NzE5NjAsImV4cCI6MjA1NjA0Nzk2MH0.Is63Tr-XV0Tv58WFsFrhDNAszorCTs75zvXEY7wX3JI"
);

export async function createStudentProfile(formData: FormData) {
  console.log("📤 Sending data to Supabase:", Object.fromEntries(formData));

  const { data, error } = await supabase
    .from("students") // Ensure this table exists in Supabase
    .insert([
      {
        name: formData.get("name"),
        education: formData.get("education"),
        skills: formData.get("skills"),
        experience: formData.get("experience"),
      },
    ])
    .select();

  if (error) {
    console.error("❌ Supabase Insert Error:", error.message);
    return { status: "error", message: error.message };
  }

  console.log("✅ Supabase Insert Success:", data);
  return { status: "success", data };
}
