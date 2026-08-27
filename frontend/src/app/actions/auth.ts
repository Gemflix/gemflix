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

export async function loginAction(formData: FormData): Promise<LoginResponse | { url: string }> {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const platform = "web";

  const apiUrl = getApiUrl();

  // 1. Llamada segura de servidor a servidor hacia Go
  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, platform }),
    cache: "no-store"
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

  // Definir las opciones base de la cookie para que funcione en todos los subdominios
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    domain: process.env.NODE_ENV === "production" ? ".gemflix.org" : undefined,
  };

  // 2. Almacenar tokens en cookies seguras e invisibles para JS del navegador
  cookieStore.set("access_token", data.access_token, {
    ...cookieOptions,
    maxAge: 60 * 15, // 15 minutos
  });

  cookieStore.set("refresh_token", data.refresh_token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  // Guardar rol genérico para el middleware (esto sí puede ser leído por JS si hace falta)
  const isStaff = data.user.roles?.length > 0 || data.user.id === 1;
  cookieStore.set("gemflix_staff_role", isStaff ? "admin" : "user", {
    ...cookieOptions,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
  });

  // Redirigir según el rol
  if (isStaff) {
    return { url: "/admin" };
  } else {
    return { url: "/play" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const apiUrl = getApiUrl();

  if (refreshToken) {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store"
    });
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
