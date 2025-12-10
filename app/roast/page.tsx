"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Roast = {
  title: string;
  text: string;
  memeTag: string;
};

type RoastResponse = {
  roasts: Roast[];
  summary?: {
    profileName?: string;
    topArtists?: string[];
    topTracks?: string[];
    recentTracks?: string[];
    playlists?: string[];
    vibeGuess?: string;
  };
};

export default function RoastPage() {
  const [data, setData] = useState<RoastResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoast = async () => {
      try {
        const res = await fetch("/api/roast");
        if (!res.ok) throw new Error("Failed to fetch roast");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    loadRoast();
  }, []);

  const roasts = data?.roasts ?? [];

  const handleNext = () => {
    if (!roasts.length) return;
    setDirection(1);
    setIndex((prev) => (prev + 1) % roasts.length);
  };

  const handlePrev = () => {
    if (!roasts.length) return;
    setDirection(-1);
    setIndex((prev) => (prev - 1 + roasts.length) % roasts.length);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-gray-700 border-t-green-500 animate-spin" />
          <p className="text-gray-400 text-sm">Cooking your roast from raw Spotify data…</p>
        </div>
      </main>
    );
  }

  if (error || !roasts.length) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        {/* Logout Button */}
<div className="absolute top-6 right-6">
  <button
    onClick={() => {
      localStorage.clear();
      window.location.href = "/api/auth/logout";
    }}
    className="px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-green-500 hover:text-green-400 text-xs md:text-sm transition font-medium"
  >
    logout
  </button>
</div>

        <div className="max-w-md text-center space-y-4">
          <h1 className="text-3xl font-bold">uh oh.</h1>
          <p className="text-gray-400 text-sm">
            couldn&apos;t fetch your Spotify data. {error && `(${error})`}
          </p>
          <p className="text-gray-500 text-xs">
            make sure you logged in with Spotify and granted permissions, then try again.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 px-5 py-2 rounded-full bg-green-500 text-black text-sm font-semibold hover:bg-green-400 transition"
          >
            Go back home
          </button>

        </div>
      </main>
    );
  }
//to fix deployment issue
  const current = roasts[index];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white flex items-center justify-center px-4 py-10">
      {/* Logout Button */}
<div className="absolute top-6 right-6">
  <button
    onClick={() => {
      localStorage.clear();
      window.location.href = "/api/auth/logout";
    }}
    className="px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-green-500 hover:text-green-400 text-xs md:text-sm transition font-medium"
  >
    logout
  </button>
</div>

      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-green-500">
            spotify roast session
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {data?.summary?.profileName || "You"} just got{" "}
            <span className="text-green-500">COOKED</span>
          </h1>
          {data?.summary?.vibeGuess && (
            <p className="text-gray-400 text-sm md:text-base">
              vibe check:{" "}
              <span className="text-gray-200 font-medium">
                {data.summary.vibeGuess}
              </span>
            </p>
          )}
        </div>

        {/* Carousel */}
        <div className="relative mt-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: direction === 1 ? 80 : -80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction === 1 ? -80 : 80, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      #{index + 1} of {roasts.length}
                    </p>
                    <h2 className="text-lg md:text-xl font-semibold">
                      {current.title}
                    </h2>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-950 text-[11px] uppercase tracking-[0.18em] text-gray-400">
                  {current.memeTag}
                </span>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-gray-100">
                {current.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-950 text-xs md:text-sm hover:border-green-500 hover:text-green-400 transition"
            >
              ⟵ previous
            </button>
            <div className="flex items-center gap-2">
              {roasts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={`h-2.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-green-500" : "w-2 bg-zinc-600"
                  }`}
                  aria-label={`Go to roast ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-950 text-xs md:text-sm hover:border-green-500 hover:text-green-400 transition"
            >
              next ⟶
            </button>
          </div>
        </div>

        {/* Data summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 text-xs md:text-sm text-gray-300">
          {data?.summary?.topArtists?.length ? (
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-500">
                top artists
              </p>
              <p className="text-gray-200">
                {data.summary.topArtists.join(" • ")}
              </p>
            </div>
          ) : null}

          {data?.summary?.topTracks?.length ? (
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-500">
                top tracks
              </p>
              <p className="text-gray-200">
                {data.summary.topTracks.slice(0, 5).join(" • ")}
              </p>
            </div>
          ) : null}

          {data?.summary?.playlists?.length ? (
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-500">
                playlists
              </p>
              <p className="text-gray-200">
                {data.summary.playlists.join(" • ")}
              </p>
            </div>
          ) : null}

          {data?.summary?.recentTracks?.length ? (
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-500">
                recently played
              </p>
              <p className="text-gray-200">
                {data.summary.recentTracks.slice(0, 5).join(" • ")}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
