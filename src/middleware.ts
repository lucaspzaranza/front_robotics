import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Get the session token
  const token = await getToken({
    req: request,
    secret:
      process.env.NODE_ENV === 'production'
        ? process.env.NEXTAUTH_SECRET
        : 'dev-secret-for-local-development',
  });

  // Define protected and public paths
  const isAuthRoute = path === '/';
  const isProtectedRoute = path !== '/';

  // Se o usuário tentar acessar uma rota protegida (e não estiver na página de login)
  // e estiver autenticado, mas o token não tiver a flag "remember" = true, force o logout
  if (isProtectedRoute) {
    if (!token) {
      // Se não estiver autenticado, redireciona para a tela de login
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Se o usuário fez login mas NÃO marcou "rememberMe" (token.remember !== true)
    if (token.remember !== true) {
      // Obtemos o header "referer"
      const referer = request.headers.get('referer') || '';

      // Construímos a URL atual completa
      const currentUrl = request.nextUrl.origin + request.nextUrl.pathname;

      // Se o referer existir e for diferente da URL atual, permitimos a navegação
      if (referer && referer !== currentUrl) {
        // Navegação entre páginas dentro do fluxo (ex.: de robot-home para charts)
        return NextResponse.next();
      } else {
        // Caso contrário (quando for refresh ou acesso direto), forçamos o logout
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('next-auth.session-token'); // Certifique-se de que este é o nome do cookie
        return response;
      }
    }
  }

  // Se estiver na página de login (rota "/") e o token existe com remember true, redireciona para "/robot-home"
  if (isAuthRoute && token && token.remember === true) {
    return NextResponse.redirect(new URL('/robot-home', request.url));
  }

  return NextResponse.next();
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (including auth)
     * - _next (Next.js internals)
     * - static files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|favicon.ico).*)',
  ],
};
