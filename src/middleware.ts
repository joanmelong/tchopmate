import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si la route commence par /admin
  if (pathname.startsWith('/admin')) {
    // Exclure la page de login et callback du middleware
    if (pathname === '/admin/login' || pathname === '/admin/login/callback') {
      return NextResponse.next();
    }

    // Pour les routes admin, vérifier la présence d'un cookie de session
    // Si pas de cookie, rediriger vers login
    const hasSessionCookie = request.cookies.has('sb-access-token') || 
                             request.cookies.has('sb-refresh-token') ||
                             request.cookies.has('supabase-auth-token');

    if (!hasSessionCookie) {
      console.log('Aucun cookie de session trouvé, redirection vers login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Laisser passer et laisser la page admin vérifier l'authentification côté client
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};