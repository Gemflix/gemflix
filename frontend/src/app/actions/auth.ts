"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    roles: string[];
  };
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const platform = "web";

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // 1. Llamada segura de servidor a servidor hacia Go
  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, platform }),
    cache: "no-store"
  });

  if (!response.ok) {
    let errorMsg = "Credenciales inválidas";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch (e) {
      const textError = await response.text();
      if (textError) errorMsg = textError;
    }
    throw new Error(errorMsg);
  }

  const data: LoginResponse = await response.json();
  const cookieStore = await cookies();

  // 2. Almacenar tokens en cookies seguras e invisibles para JS del navegador
  cookieStore.set("access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Lax es mejor para permitir navegación general
    maxAge: 60 * 15, // 15 minutos
    path: "/",
  });

  cookieStore.set("refresh_token", data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
  });

  // Guardar rol genérico para el middleware (esto sí puede ser leído por JS si hace falta)
  const isStaff = data.user.roles?.length > 0 || data.user.id === 1;
  cookieStore.set("gemflix_staff_role", isStaff ? "admin" : "user", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  if (refreshToken) {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store"
    });
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("gemflix_staff_role");
  
  redirect("/login");
}
