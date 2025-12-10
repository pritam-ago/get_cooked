// server/auth/login.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();


const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");

  const scope = 'user-read-private user-read-email';

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  });

  // Store state in a cookie to validate later
  const res = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
  res.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  return res;
}
