import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


export async function POST(request: Request) {
  const supabase = await createClient(); // Remove cookieStore parameter
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  const url = new URL('/login', request.url);
  return NextResponse.redirect(url.toString());
}