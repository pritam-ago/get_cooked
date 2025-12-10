// app/lib/spotify.ts
import { cookies } from "next/headers";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

async function getAccessTokenFromCookies() {
  const store = await cookies();
  return store.get("spotify_access_token")?.value;
}

async function spotifyRequest(path: string) {
  const token = await getAccessTokenFromCookies();
  if (!token) {
    throw new Error("No Spotify access token. User probably not logged in.");
  }

  const res = await fetch(`${SPOTIFY_API_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function fetchSpotifyProfile() {
  return spotifyRequest("me");
}

export async function fetchTopArtists() {
  return spotifyRequest("me/top/artists?limit=10&time_range=short_term");
}

export async function fetchTopTracks() {
  return spotifyRequest("me/top/tracks?limit=10&time_range=short_term");
}

export async function fetchRecentlyPlayed() {
  return spotifyRequest("me/player/recently-played?limit=20");
}

export async function fetchPlaylists() {
  return spotifyRequest("me/playlists?limit=10");
}
