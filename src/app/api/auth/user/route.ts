// import { NextResponse } from 'next/server';
// import { createClient } from '@/utils/supabase/server';
// import { cookies } from 'next/headers';

// export async function GET() {
//   const cookieStore = cookies();
//   const supabase = await createClient(cookieStore);
  
//   const { data: { session }, error } = await supabase.auth.getSession();
  
//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }
  
//   if (!session) {
//     return NextResponse.json({ user: null });
//   }
  
//   return NextResponse.json({ user: session.user });
// }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  if (!session) {
    return NextResponse.json({ user: null });
  }
  
  return NextResponse.json({ user: session.user });
}