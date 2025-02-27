import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createClient()
      
      // Exchange code for session
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      if (sessionError) {
        console.error("Session exchange error:", sessionError.message)
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }
      
      // Get user data after successful session exchange
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        console.error("Error fetching user data:", userError?.message || "User data is null")
        return NextResponse.redirect(`${origin}/error`)
      }
      
      // Check if user already exists in user_profiles table
      const { data: existingUser, error: queryError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", userData.user.email)
        .maybeSingle()
      
      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows"
        console.error("Error checking existing user:", queryError.message)
        return NextResponse.redirect(`${origin}/error`)
      }
      
      // Insert user if they don't exist yet
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            email: userData.user.email,
            username: userData.user.user_metadata?.user_name || userData.user.email?.split('@')[0]
          })
        
        if (insertError) {
          console.error("Error inserting user data:", insertError.message)
          return NextResponse.redirect(`${origin}/error`)
        }
      }
      
      // Handle redirects
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      return NextResponse.redirect(`${origin}/error`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}