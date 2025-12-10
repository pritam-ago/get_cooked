// server/auth/callback.ts
import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;

// Converts "id:secret" → base64
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const storedState = req.cookies.get("spotify_auth_state")?.value;

  if (!code || !returnedState || returnedState !== storedState) {
    return NextResponse.json(
      { error: "State mismatch or missing code" },
      { status: 400 }
    );
  }

  // Exchange code for tokens
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return NextResponse.json(tokenData, { status: 400 });
  }

  const res = NextResponse.redirect("https://getcooked.vercel.app/roast");

  // Save tokens in httpOnly cookies
  res.cookies.set("spotify_access_token", tokenData.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  res.cookies.set("spotify_refresh_token", tokenData.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  // Clear state cookie
  res.cookies.delete("spotify_auth_state");

  return res;
}
