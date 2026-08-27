import { NextResponse } from "next/server";

// Endpoint público que devuelve la configuración necesaria para el frontend
// La clave de Turnstile es PÚBLICA (no es un secreto), solo necesita estar en el cliente
export async function GET() {
  return NextResponse.json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "",
  });
}
