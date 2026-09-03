import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";

/**
 * Proxy autenticado para las rutas /api/admin/*.
 * Lee el access_token del cookie httpOnly (disponible en el servidor)
 * y lo reenvía al backend como Authorization: Bearer <token>.
 * El navegador no puede leer el cookie httpOnly directamente.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToBackend(request, params, "GET");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToBackend(request, params, "POST");
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToBackend(request, params, "PUT");
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToBackend(request, params, "DELETE");
}

async function proxyToBackend(
  request: Request,
  paramsPromise: Promise<{ path: string[] }>,
  method: string
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { path } = await paramsPromise;
  const pathStr = path.join("/");
  const url = new URL(request.url);
  const queryString = url.search;

  const apiUrl = getApiUrl();
  const backendUrl = `${apiUrl}/admin/${pathStr}${queryString}`;

  const headers: HeadersInit = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  let body: string | undefined;
  if (method !== "GET" && method !== "DELETE") {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const res = await fetch(backendUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[Admin Proxy] Error proxying to ${backendUrl}:`, error);
    return NextResponse.json({ error: "Error de conexión con el backend" }, { status: 502 });
  }
}
