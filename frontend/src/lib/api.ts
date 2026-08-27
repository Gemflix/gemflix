export function getApiUrl(): string {
  // Cuando se ejecuta en el servidor (SSR, Server Actions, middleware)
  if (typeof window === "undefined") {
    return process.env.API_INTERNAL_URL || "http://backend:8080";
  }
  // Cuando se ejecuta en el cliente (Browser)
  return process.env.NEXT_PUBLIC_API_URL || "";
}
