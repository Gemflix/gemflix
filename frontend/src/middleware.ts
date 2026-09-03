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

export async function middleware(req: NextRequest) {
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
  
  // 1.5. LOGIN GLOBAL (Único para todos los subdominios)
  // Si están en la ruta de login, no reescribimos al subdominio, dejamos que vaya a app/login
  if (url.pathname.startsWith('/login')) {
    return NextResponse.next();
  }
  
  // 2. Definimos mapeos de subdominios a rutas
  const hasAccessToken  = req.cookies.has("access_token");
  const hasRefreshToken = req.cookies.has("refresh_token");
  const roleValue = req.cookies.get("gemflix_staff_role")?.value || "user";
  
  // Consideramos staff a cualquiera con un rol que no sea 'user' vacío
  const isStaff = roleValue !== "user" && roleValue !== "";

  // Si no hay access_token pero SÍ hay refresh_token, renovar en silencio
  const hasSession = hasAccessToken || hasRefreshToken;

  // Helper para renovar el token antes de seguir
  const refreshAndContinue = () => {
    const refreshUrl = new URL("/api/auth/refresh", req.url);
    refreshUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(refreshUrl);
  };
  
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
    const isApiRoute  = url.pathname.startsWith('/api/');

    if (!isLoginPage && !isApiRoute) {
      // Sin sesión alguna → login
      if (!hasSession) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      // Tiene refresh pero no access → renovar silenciosamente
      if (!hasAccessToken && hasRefreshToken) {
        return refreshAndContinue();
      }
      // Tiene sesión pero no es staff → expulsar a play
      if (!isStaff) {
        return redirectToPlay();
      }
    }

    // Si es staff y está en login pero ya tiene sesión, mandar al panel
    if (hasSession && isStaff && isLoginPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Login y rutas API NO llevan prefijo /admin — mapean a las páginas raíz de Next.js
    // Si van a la raíz del panel admin, redirigir al dashboard
    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.rewrite(new URL(path, req.url));
  }
  
  // Regla general para Play, Drive, Jellyfin: Si es Staff, expulsarlo a Admin.
  // NOTA: En localhost desactivamos la expulsión porque las cookies no se comparten entre subdominios y genera un bucle de login. En prod sí funciona.
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (!isDevelopment && (currentHost.startsWith('play.') || currentHost.startsWith('drive.') || currentHost.startsWith('jellyfin.'))) {
    if (hasSession && isStaff) {
      return redirectToAdmin();
    }
  }

  // --- FORZAR LOGIN GLOBAL ---
  // Consultamos el backend interno para saber si public_catalog está habilitado
  // (Este fetch es rápido porque es interno, pero en Vercel Edge requeriría una URL completa).
  let publicCatalog = "true";
  try {
    const apiUrl = process.env.API_INTERNAL_URL || "http://127.0.0.1:8080";
    const res = await fetch(`${apiUrl}/play/settings`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.public_catalog === "false") {
         publicCatalog = "false";
      }
    }
  } catch (err) {
    // Si el backend cae, asumimos false por seguridad
    console.error("[Middleware] Error fetching settings:", err);
  }

  // Si public_catalog está en false y no hay sesión, nadie puede acceder a play, drive o jellyfin
  const isProtectedSubdomain = currentHost.startsWith('play.') || currentHost.startsWith('drive.') || currentHost.startsWith('jellyfin.');
  
  console.log(`[Middleware] Protected Subdomain: ${isProtectedSubdomain}, publicCatalog API says: ${publicCatalog}, hasSession: ${hasSession}`);

  if (isProtectedSubdomain && publicCatalog === "false" && !hasSession && !url.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  // -----------------------------

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
  
  // Redirigir de forma automática si entran a una carpeta que es un subdominio (ej: /play o /admin)
  const isReservedFolder = url.pathname.startsWith('/admin') || url.pathname.startsWith('/play') || url.pathname.startsWith('/drive') || url.pathname.startsWith('/jellyfin');
  
  if (isReservedFolder) {
    const targetSubdomain = url.pathname.split('/')[1]; // extrae 'admin', 'play', etc
    
    // Si ya estamos en ese subdominio, le quitamos la carpeta para no tener play.localhost:3000/play
    if (currentHost.startsWith(`${targetSubdomain}.`)) {
      const newPath = url.pathname.replace(`/${targetSubdomain}`, '') || '/';
      return NextResponse.redirect(new URL(newPath, req.url));
    } else {
      // Si estamos en el dominio principal o en otro lado, enviarlo al subdominio correcto
      const newPath = url.pathname.replace(`/${targetSubdomain}`, '') || '/';
      const newUrl = new URL(newPath, `${proto}://${targetSubdomain}.${baseDomain}${port}`);
      return NextResponse.redirect(newUrl);
    }
  }

  // Si están visitando la raíz del dominio principal gemflix.org (sin subdominio)
  if (currentHost === baseDomain) {
    // Si tienen sesión y son staff, enviarlos al panel admin (En localhost lo omitimos por las cookies)
    if (hasSession && isStaff && url.pathname === '/' && !isDevelopment) {
      return redirectToAdmin();
    }
    
    // Si tienen sesión y visitan la raíz (usuario normal), enviarlos al hub
    if (hasSession && !isStaff && url.pathname === '/') {
      return NextResponse.redirect(new URL('/hub', req.url));
    }
    
    // Si intentan entrar a /hub sin sesión, expulsarlos al login
    if (!hasSession && url.pathname.startsWith('/hub')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Por defecto (Portal / Landing Page)
  // Reescribimos al home (o /portal si tienes una carpeta específica para el root)
  return NextResponse.next();
}
