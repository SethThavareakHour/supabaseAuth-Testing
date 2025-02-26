// import { createClient } from '@/utils/supabase/server';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// export async function getUser() {
//   const cookieStore = cookies();
//   const supabase = await createClient(cookieStore);
  
//   const { data: { session } } = await supabase.auth.getSession();
  
//   if (!session) {
//     return null;
//   }
  
//   return session.user;
// }

// export async function requireAuth() {
//   const user = await getUser();
  
//   if (!user) {
//     redirect('/login');
//   }
  
//   return user;
// }

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function getUser() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  return session.user;
}

export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}