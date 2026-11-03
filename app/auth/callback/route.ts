import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// OAuth (Google) returns here with ?code=... — exchange it for a session cookie.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') || '/wallet'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/wallet'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`)
}
