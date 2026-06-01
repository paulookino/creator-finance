import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isDemo      = request.nextUrl.pathname.startsWith('/demo')
  const isPublic    = request.nextUrl.pathname.startsWith('/pricing') ||
                      request.nextUrl.pathname.startsWith('/onboarding') ||
                      request.nextUrl.pathname.startsWith('/update-password')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/signup')
  const isProtected = !isDemo && !isPublic && (
                      request.nextUrl.pathname.startsWith('/dashboard') ||
                      request.nextUrl.pathname.startsWith('/receita') ||
                      request.nextUrl.pathname.startsWith('/produtos') ||
                      request.nextUrl.pathname.startsWith('/impostos') ||
                      request.nextUrl.pathname.startsWith('/calendario') ||
                      request.nextUrl.pathname.startsWith('/integracoes') ||
                      request.nextUrl.pathname.startsWith('/configuracoes'))

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
