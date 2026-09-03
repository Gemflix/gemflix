import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiUrl = getApiUrl();
    const goRes = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!goRes.ok) {
      const errorText = await goRes.text();
      return NextResponse.json({ error: errorText }, { status: goRes.status });
    }

    const setCookieHeader = goRes.headers.get("set-cookie");
    const goJson = await goRes.json();
    const response = NextResponse.json(goJson);

    if (setCookieHeader) {
      const tokenMatch = setCookieHeader.match(/gemflix_session=([^;]+)/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        const cookieStore = await cookies();
        cookieStore.set({
          name: "gemflix_session",
          value: token,
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          domain: process.env.NODE_ENV === "production" ? ".gemflix.org" : undefined,
          maxAge: 60 * 60 * 24 * 7
        });
      }
    }

    return response;
  } catch (error: any) {
    console.error("DEBUG NEXTJS ROUTE ERROR:", error);
    return NextResponse.json({ error: "Error de conexión con el backend" }, { status: 500 });
  }
}
