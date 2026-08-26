import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Obtenemos el hostname de los headers (ej. admin.localhost:3000)
  const hostname = req.headers.get('host') || 'localhost:3000';
  
  // Extraemos el subdominio (ignorando puertos y dominios base)
  const currentHost = hostname.split(':')[0]; // admin.localhost -> admin.localhost
  
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;
  
  // 1. Dejar pasar las peticiones a la API para que next.config.ts las reescriba (Proxy)
  if (url.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // 2. Definimos mapeos de subdominios a rutas
  const hasSession = req.cookies.has('gemflix_session');
  const roleValue = req.cookies.get('gemflix_staff_role')?.value || 'user';
  
  // Consideramos staff a cualquiera con un rol que no sea 'user' vacío
  const isStaff = roleValue !== 'user' && roleValue !== '';
  
  console.log(`[Middleware] Host: ${currentHost}, hasSession: ${hasSession}, roleValue: ${roleValue}, isStaff: ${isStaff}`);
  console.log(`[Middleware] All Cookies:`, req.cookies.getAll().map(c => `${c.name}=${c.value}`).join('; '));
  
  // Base domain for cross-domain redirects (e.g. localhost:3000)
  const baseDomain = hostname.split(':')[0].replace(/^(admin|play|drive|jellyfin)\./, '');
  const port = hostname.split(':')[1] ? `:${hostname.split(':')[1]}` : '';
  const proto = req.headers.get('x-forwarded-proto') || (hostname.includes('localhost') ? 'http' : 'https');

  // Funciones de ayuda para redirecciones entre subdominios
  const redirectToAdmin = () => NextResponse.redirect(new URL('/', `${proto}://admin.${baseDomain}${port}`));
  const redirectToPlay = () => NextResponse.redirect(new URL('/', `${proto}://play.${baseDomain}${port}`));

  // Si el host empieza con "admin."
  if (currentHost.startsWith('admin.')) {
    const isLoginPage = url.pathname.startsWith('/login');
    const isApiRoute = url.pathname.startsWith('/api/');

    if (!hasSession && !isLoginPage && !isApiRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Si tiene sesión pero no es staff, no puede estar en admin
    // Permitimos que entren al login page para que puedan arreglar su sesión (re-login)
    if (hasSession && !isStaff && !isApiRoute && !isLoginPage) {
      return redirectToPlay();
    }

    // Si es staff y está en login pero ya tiene sesión
    if (hasSession && isStaff && isLoginPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const cleanPath = path.startsWith('/admin') ? path.replace('/admin', '') || '/' : path;
    return NextResponse.rewrite(new URL(`/admin${cleanPath === '/' ? '' : cleanPath}`, req.url));
  }
  
  // Regla general para Play, Drive, Jellyfin: Si es Staff, expulsarlo a Admin.
  if (currentHost.startsWith('play.') || currentHost.startsWith('drive.') || currentHost.startsWith('jellyfin.')) {
    if (hasSession && isStaff) {
      return redirectToAdmin();
    }
  }

  // Rutas específicas de subdominios
  if (currentHost.startsWith('play.')) {
    return NextResponse.rewrite(new URL(`/play${path === '/' ? '' : path}`, req.url));
  }
  
  if (currentHost.startsWith('drive.')) {
    return NextResponse.rewrite(new URL(`/drive${path === '/' ? '' : path}`, req.url));
  }
  
  if (currentHost.startsWith('jellyfin.')) {
    return NextResponse.rewrite(new URL(`/jellyfin${path === '/' ? '' : path}`, req.url));
  }
  
  // Redirigir de forma automática si entran a /admin desde el dominio principal
  if (url.pathname.startsWith('/admin')) {
    const proto = req.headers.get('x-forwarded-proto') || (hostname.includes('localhost') ? 'http' : 'https');
    const newPath = url.pathname.replace('/admin', '') || '/';
    const newUrl = new URL(newPath, `${proto}://admin.${hostname}`);
    return NextResponse.redirect(newUrl);
  }

  // Por defecto (Portal / Landing Page)
  // Reescribimos al home (o /portal si tienes una carpeta específica para el root)
  return NextResponse.next();
}
