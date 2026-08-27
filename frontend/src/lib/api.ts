export function getApiUrl(): string {
  // Cuando se ejecuta en el servidor (SSR, Server Actions, middleware)
  if (typeof window === "undefined") {
    return process.env.API_INTERNAL_URL || "http://backend:8080";
  }
  // Cuando se ejecuta en el cliente (Browser)
  return process.env.NEXT_PUBLIC_API_URL || "";
}

/**
 * Lee el access_token de las cookies del navegador y lo retorna como
 * header Authorization para llamadas API desde el cliente.
 * Los cookies httpOnly NO son accesibles aquí, por lo que el admin
 * usa el proxy de Next.js (/api/*) que reenvía las cookies automáticamente.
 */
export function getAdminFetchOptions(): RequestInit {
  return {
    credentials: "include" as RequestCredentials,
    headers: {
      "Content-Type": "application/json",
    },
  };
}
