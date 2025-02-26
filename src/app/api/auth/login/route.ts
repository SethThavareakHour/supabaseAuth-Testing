// import { NextResponse } from 'next/server';
// import { createClient } from '@/utils/supabase/server';
// import { cookies } from 'next/headers';

// export async function POST(request: Request) {
//   const cookieStore = cookies();
//   const supabase = await createClient(cookieStore);
//   const { email, password } = await request.json();

//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }

//   return NextResponse.json({ user: data.user });
// }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient(); // Remove cookieStore parameter
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user });
}