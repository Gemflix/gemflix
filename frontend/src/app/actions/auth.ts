"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiUrl } from "@/lib/api";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    roles: string[];
  };
}

// Tiempos estilo Netflix/Spotify
const ACCESS_TOKEN_TTL  = 60 * 60;           // 1 hora
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 días
const REMEMBER_ME_TTL   = 60 * 60 * 24 * 7;  // 7 días para access si se recuerda

async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true; // Si no hay clave configurada, pasar (desarrollo)

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: secretKey, response: token }),
    cache: "no-store",
  });

  const data = await res.json();
  return data.success === true;
}

export async function loginAction(formData: FormData): Promise<{ url: string }> {
  const email      = formData.get("email")?.toString() || "";
  const password   = formData.get("password")?.toString() || "";
  const rememberMe = formData.get("rememberMe") === "on";
  const captchaToken = formData.get("cf-turnstile-response")?.toString() || "";
  const platform   = "web";

  // 1. Verificar CAPTCHA (en producción)
  if (process.env.NODE_ENV === "production") {
    const captchaOk = await verifyCaptcha(captchaToken);
    if (!captchaOk) {
      throw new Error("Verificación de seguridad fallida. Por favor, intenta de nuevo.");
    }
  }

  const apiUrl = getApiUrl();

  // 2. Llamada segura de servidor a servidor hacia Go
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, platform }),
    cache: "no-store",
  });

  if (!response.ok) {
    let errorMsg = "Credenciales inválidas";
    const textError = await response.text();
    if (textError) {
      try {
        const errorData = JSON.parse(textError);
        if (errorData.error) errorMsg = errorData.error;
      } catch (e) {
        errorMsg = textError;
      }
    }
    throw new Error(errorMsg);
  }

  const data: LoginResponse = await response.json();
  const cookieStore = await cookies();

  // Opciones base — dominio comodín para compartir entre subdominios
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    domain: process.env.NODE_ENV === "production" ? ".gemflix.org" : undefined,
  };

  // 3. Access token: 1h normal, 7d si "Recordar sesión"
  cookieStore.set("access_token", data.access_token, {
    ...cookieOptions,
    maxAge: rememberMe ? REMEMBER_ME_TTL : ACCESS_TOKEN_TTL,
  });

  // 4. Refresh token: siempre 30 días (estilo Netflix/Spotify)
  cookieStore.set("refresh_token", data.refresh_token, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_TTL,
  });

  // 5. Cookie de rol (legible por el middleware)
  const isStaff = (data.user.roles?.length > 0) || data.user.id === 1;
  cookieStore.set("gemflix_staff_role", isStaff ? "admin" : "user", {
    ...cookieOptions,
    httpOnly: false,
    maxAge: REFRESH_TOKEN_TTL,
  });

  // 6. Redirigir según el rol
  return { url: isStaff ? "/dashboard" : "/play" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const apiUrl = getApiUrl();

  // Intentar invalidar el refresh token en el backend
  if (refreshToken) {
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      });
    } catch (e) {
      // Si falla, de todas formas borramos las cookies locales
    }
  }

  const cookieOptions = {
    path: "/",
    domain: process.env.NODE_ENV === "production" ? ".gemflix.org" : undefined,
  };

  cookieStore.delete({ name: "access_token", ...cookieOptions });
  cookieStore.delete({ name: "refresh_token", ...cookieOptions });
  cookieStore.delete({ name: "gemflix_staff_role", ...cookieOptions });

  redirect("/login");
}
