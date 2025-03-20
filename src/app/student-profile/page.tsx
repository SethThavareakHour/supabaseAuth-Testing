import Link from "next/link";

import StudentBasicForm from "@/components/StudentBasicForm";
import StudentDetailForm from "@/components/StudentDetailForm";
import { createClient } from "@/utils/supabase/server";

export default async function StudentProfile() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mt-4">
        <Link href="/student-profile/edit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Edit Profile
        </Link>
      </div>
      Hello, {data?.user?.email}
      <StudentBasicForm/>
      <StudentDetailForm/>

    </div>

  );
}