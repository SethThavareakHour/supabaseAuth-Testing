import StudentBasicForm from "@/components/StudentBasicForm";
import { createClient } from "@/utils/supabase/server";

export default async function StudentProfile() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
    Hello, {data?.user?.email}
       <StudentBasicForm/>
    </div>
  );
}