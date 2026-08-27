import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api";

const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 días

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirect") || "/";

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      // Refresh token inválido o expirado → ir al login
      const cookieOptions = {
        path: "/",
        domain: process.env.NODE_ENV === "production" ? ".gemflix.org" : undefined,
      };
      cookieStore.delete({ name: "access_token", ...cookieOptions });
      cookieStore.delete({ name: "refresh_token", ...cookieOptions });
      cookieStore.delete({ name: "gemflix_staff_role", ...cookieOptions });
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const data = await response.json();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".gemflix.org" : undefined,
    };

    const res = NextResponse.redirect(new URL(redirectTo, request.url));

    // Establecer nuevo access_token
    res.cookies.set("access_token", data.access_token, {
      ...cookieOptions,
      maxAge: 60 * 60, // 1 hora
    });

    // Si el backend devuelve nuevo refresh_token (sliding window), actualizarlo
    if (data.refresh_token) {
      res.cookies.set("refresh_token", data.refresh_token, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_TTL,
      });
    }

    // Actualizar la cookie de rol si viene en la respuesta
    if (data.user) {
      const isStaff = (data.user.roles?.length > 0) || data.user.id === 1;
      res.cookies.set("gemflix_staff_role", isStaff ? "admin" : "user", {
        ...cookieOptions,
        httpOnly: false,
        maxAge: REFRESH_TOKEN_TTL,
      });
    }

    return res;
  } catch (e) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
