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

export const runtime = "nodejs"; // better stability on Vercel

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function GET() {
  try {
    console.log("🔥 /api/roast hit");

    /** 1️⃣ AUTH CHECK */
    const store = await cookies();
    const token = store.get("spotify_access_token")?.value;

    console.log("🍪 spotify_access_token =", token ? "FOUND" : "MISSING");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    /** 2️⃣ FETCH SPOTIFY DATA */
    const [profile, topArtists, topTracks, recent, playlists] = await Promise.all([
      fetchSpotifyProfile(),
      fetchTopArtists(),
      fetchTopTracks(),
      fetchRecentlyPlayed(),
      fetchPlaylists(),
    ]);

    const profileName = profile?.display_name ?? "this user";

    const topArtistNames = topArtists?.items?.map((a: any) => a.name) ?? [];
    const topTrackNames =
      topTracks?.items?.map(
        (t: any) => `${t.name} – ${t.artists?.[0]?.name ?? "Unknown"}`
      ) ?? [];
    const recentTrackNames =
      recent?.items?.map(
        (i: any) => `${i.track?.name} – ${i.track?.artists?.[0]?.name}`
      ) ?? [];
    const playlistNames = playlists?.items?.map((p: any) => p.name) ?? [];

    /** 3️⃣ GENERATED VIBE GUESS */
    const vibeGuess = (() => {
      const txt = topArtistNames.join(" ").toLowerCase();
      if (txt.includes("taylor")) return "delulu heartbreak pop enjoyer";
      if (txt.includes("weeknd")) return "nightdrive emotional damage specialist";
      if (txt.includes("arijit")) return "bollywood sadboi/girl with 3AM thoughts";
      if (txt.includes("drake")) return "fake sigma who screenshots quotes";
      return "pure chaos playlist curator";
    })();

    /** 4️⃣ PROMPT FOR GEMINI — brutally GenZ + Tanglish */
    const prompt = `
You are a **ruthless Gen-Z Indian roast bot**.
You must roast the user's Spotify taste like a **chaotic teen roasting their friend**.
Tone MUST be:
- GenZ slang  
- Tanglish (mixture of Tamil + English) if it helps  
- Meme-coded, toxic-funny, sarcastic, over-dramatic  
- Internet reference friendly (TikTok, reels, sigma, npc, etc.)
- Dark humor allowed, but **NO slurs and NO hate towards protected groups**.

Roast only their MUSIC taste, playlists, and personality inferred from it.
Attack their personality, life choices, and vibe based on their Spotify data.

User: ${profileName}

Top artists: ${topArtistNames.join(", ")}
Top tracks: ${topTrackNames.join("; ")}
Recently played: ${recentTrackNames.join("; ")}
Playlists: ${playlistNames.join(", ")}
Vibe guess: ${vibeGuess}

Return EXACTLY this JSON:
{
  "roasts": [
    {
      "title": "short roast title (no emojis)",
      "text": "longer roast, 3–5 sentences. Must be ROUGH, Gen-Z, meme heavy, Tanglish allowed.",
      "memeTag": "funny meme-style label (no emojis)"
    }
  ]
}

Do NOT wrap response in \`\`\`json or code fences.
Return RAW JSON only.
`;

    /** 5️⃣ GEMINI CALL */
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let rawText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

    /** Strip code fences */
    rawText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/```/g, "")
      .trim();

    /** 6️⃣ PARSE JSON SAFELY */
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.log("❌ BAD JSON FROM GEMINI:", rawText);
      parsed = {
        roasts: [
          {
            title: "Gemini had a breakdown",
            text:
              "AI rendu nalaala overthink pannitu irruku. Raw output: " +
              rawText,
            memeTag: "ai_melted",
          },
        ],
      };
    }

    /** 7️⃣ RETURN CLEAN JSON */
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
      { error: "Roast generation failed", details: err?.message },
      { status: 500 }
    );
  }
}
