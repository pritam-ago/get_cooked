// app/api/roast/route.ts
import { NextResponse } from "next/server";
import {
  fetchSpotifyProfile,
  fetchTopArtists,
  fetchTopTracks,
  fetchRecentlyPlayed,
  fetchPlaylists,
} from "../../lib/spotify";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function GET() {
  try {
    // 1. Fetch Spotify stuff in parallel
    const [profile, topArtists, topTracks, recent, playlists] = await Promise.all([
      fetchSpotifyProfile(),
      fetchTopArtists(),
      fetchTopTracks(),
      fetchRecentlyPlayed(),
      fetchPlaylists(),
    ]);

    const profileName = profile?.display_name ?? "this user";

    // 2. Prepare compact summaries
    const topArtistNames: string[] =
      topArtists?.items?.map((a: any) => a.name).slice(0, 10) ?? [];

    const topTrackNames: string[] =
      topTracks?.items
        ?.slice(0, 10)
        .map(
          (t: any) =>
            `${t.name} – ${t.artists?.[0]?.name ?? "Unknown"}`
        ) ?? [];

    const recentTrackNames: string[] =
      recent?.items
        ?.slice(0, 15)
        .map(
          (item: any) =>
            `${item.track?.name ?? "Unknown"} – ${
              item.track?.artists?.[0]?.name ?? "Unknown"
            }`
        ) ?? [];

    const playlistNames: string[] =
      playlists?.items?.map((p: any) => p.name).slice(0, 10) ?? [];

    const vibeGuess = (() => {
      const artistsStr = topArtistNames.join(" ").toLowerCase();
      if (artistsStr.includes("taylor")) return "heartbreak pop, delulu main character arc";
      if (artistsStr.includes("weeknd")) return "late night neon city with unresolved issues";
      if (artistsStr.includes("arijit") || artistsStr.includes("darshan")) {
        return "bollywood romantic + sad boy/girl core";
      }
      if (artistsStr.includes("drake") || artistsStr.includes("travis")) {
        return "rap / trap gym bro trying to be sigma";
      }
      return "mixed bag of Spotify-core, nostalgia, and algorithm leftovers";
    })();

    // 3. Build Gemini prompt – ask for JSON
    const prompt = `
You are a savage but SAFE roast bot. You brutally roast a user's music taste
based on their Spotify data. Rules:
- NO slurs, hate speech, or attacking protected groups.
- Only roast their music taste and light personality stereotypes.
- Tone: chaotic Gen-Z, meme-heavy, like viral Twitter / Instagram / TikTok captions.

User display name: ${profileName}

Top artists:
${topArtistNames.join(", ") || "none"}

Top tracks:
${topTrackNames.join("; ") || "none"}

Recently played:
${recentTrackNames.join("; ") || "none"}

Playlists:
${playlistNames.join(", ") || "none"}

Your guess of their vibe:
${vibeGuess}

Now generate EXACTLY 5 roasts.

Return JSON ONLY in this exact format:

{
  "roasts": [
    {
      "title": "short spicy title",
      "text": "2-4 sentence roast, very funny, refer to specific artists/songs if possible.",
      "memeTag": "short meme-style label like 'delulu swiftie', '2016 tumblr survivor'",
      "vibeEmoji": "one or two emojis that match the vibe"
    },
    ...
  ]
}

No explanations, no extra text, just valid JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text;
    let parsed: any;

    try {
      parsed = JSON.parse(rawText || "{}");
    } catch (e) {
      // if JSON parsing fails, fallback to 1 big roast
      parsed = {
        roasts: [
          {
            title: "Gemini had a meltdown",
            text: rawText,
            memeTag: "ai_scuffed",
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
  } catch (error: any) {
    console.error("Roast API error:", error);
    return NextResponse.json(
      { error: "Failed to generate roast", details: error?.message },
      { status: 500 }
    );
  }
}
