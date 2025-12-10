// app/api/roast/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  fetchSpotifyProfile,
  fetchTopArtists,
  fetchTopTracks,
  fetchRecentlyPlayed,
  fetchPlaylists,
} from "@/app/lib/spotify";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export async function GET() {
  try {
    console.log("🔥 /api/roast hit");

    const store = await cookies();
    const token = store.get("spotify_access_token")?.value;

    console.log("🍪 spotify_access_token =", token ? "FOUND" : "MISSING");

    if (!token) {
      return NextResponse.json(
        { error: "Missing Spotify access token cookie" },
        { status: 401 }
      );
    }

    // Fetch Spotify data
    const [profile, topArtists, topTracks, recent, playlists] = await Promise.all([
      fetchSpotifyProfile(),
      fetchTopArtists(),
      fetchTopTracks(),
      fetchRecentlyPlayed(),
      fetchPlaylists(),
    ]);

    const profileName = profile?.display_name ?? "this user";

    const topArtistNames = topArtists?.items?.map((a: any) => a.name) ?? [];
    const topTrackNames = topTracks?.items?.map(
      (t: any) => `${t.name} – ${t.artists?.[0]?.name ?? "Unknown"}`
    ) ?? [];
    const recentTrackNames = recent?.items?.map(
      (i: any) => `${i.track?.name} – ${i.track?.artists?.[0]?.name}`
    ) ?? [];
    const playlistNames = playlists?.items?.map((p: any) => p.name) ?? [];

    // Vibe guess
    const vibeGuess = (() => {
      const a = topArtistNames.join(" ").toLowerCase();
      if (a.includes("taylor")) return "heartbreak pop, delulu main character arc";
      if (a.includes("weeknd")) return "neon nightwalker energy";
      if (a.includes("arijit")) return "bollywood sadboi/girl energy";
      if (a.includes("drake")) return "wannabe sigma gym-bro playlist";
      return "spotify-core chaos with nostalgia sprinkles";
    })();

    // Gemini prompt
    const prompt = `
You are a savage but SAFE roast bot. Roast the user's Spotify taste.
NO hate speech or slurs. Only roast their music taste.

User: ${profileName}

Top artists: ${topArtistNames.join(", ")}
Top tracks: ${topTrackNames.join("; ")}
Recently played: ${recentTrackNames.join("; ")}
Playlists: ${playlistNames.join(", ")}
Vibe guess: ${vibeGuess}

Return EXACTLY this JSON format:

{
  "roasts": [
    {
      "title": "...",
      "text": "...",
      "memeTag": "...",
      "vibeEmoji": "..."
    }
  ]
}
`;

    // Gemini call
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.log("❌ BAD JSON FROM GEMINI:", rawText);
      parsed = {
        roasts: [
          {
            title: "AI Glitched",
            text: rawText,
            memeTag: "gemini_melted",
            vibeEmoji: "🤖🔥",
          },
        ],
      };
    }

    return NextResponse.json({
      roasts: parsed.roasts ?? [],
      summary: {
        profileName,
        topArtists: topArtistNames,
        topTracks: topTrackNames,
        recentTracks: recentTrackNames,
        playlists: playlistNames,
        vibeGuess,
      },
    });
  } catch (err: any) {
    console.error("🔥 Roast API error:", err);
    return NextResponse.json(
      { error: "Failed to generate roast", details: err?.message },
      { status: 500 }
    );
  }
}
