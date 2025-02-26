// import { NextResponse } from 'next/server';
// import { createClient } from '@/utils/supabase/server';
// import { cookies } from 'next/headers';

// export async function POST(request: Request) {
//   const cookieStore = cookies();
//   const supabase = await createClient(cookieStore);
//   const { email, password, name } = await request.json();

//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       data: {
//         name,
//       },
//     },
//   });

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }

//   // Optionally create a user profile in your database
//   if (data.user) {
//     const { error: profileError } = await supabase
//       .from('profiles')
//       .insert({ id: data.user.id, name, email });

//     if (profileError) {
//       console.error('Error creating user profile:', profileError);
//     }
//   }

//   return NextResponse.json({ 
//     message: 'Check your email for the confirmation link', 
//     user: data.user 
//   });
// }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: 'Failed to create Supabase client' }, { status: 500 });
  }

  const { email, password, name } = await request.json();

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  // Optionally create a user profile in your database
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, name, email });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }

  return NextResponse.json({ 
    message: 'Check your email for the confirmation link', 
    user: data.user 
  });
}