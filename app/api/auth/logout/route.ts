import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect("/");

  res.cookies.set("spotify_access_token", "", {
    expires: new Date(0),
    path: "/",
  });

  res.cookies.set("spotify_refresh_token", "", {
    expires: new Date(0),
    path: "/",
  });

  return res;
}
