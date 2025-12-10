// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = NextResponse.redirect("https://getcooked.vercel.app/");

    // Delete cookies safely
    res.cookies.delete("spotify_access_token");
    res.cookies.delete("spotify_refresh_token");

    return res;
  } catch (err) {
    console.error("🚨 Logout Error:", err);
    return NextResponse.json(
      { error: "Logout failed", details: String(err) },
      { status: 500 }
    );
  }
}
