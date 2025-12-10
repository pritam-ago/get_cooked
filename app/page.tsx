"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight"
        >
          GET <span className="text-green-500">COOKED</span> BY YOUR SPOTIFY
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-400 text-lg md:text-xl"
        >
          Let AI roast you based on your questionable music taste.  
          Just one Spotify login away hehehe
        </motion.p>

        {/* Button */}
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          onClick={() => (window.location.href = "/api/auth/login")}
          className="
            bg-green-500 text-black font-semibold px-6 py-3 rounded-full 
            text-lg shadow-xl hover:bg-green-400 transition-all
            active:scale-95
          "
        >
          Connect with Spotify
        </motion.button>

        {/* Footer */}
        <p className="text-gray-600 text-sm pt-6">
          We never modify your playlists. We just judge them.
        </p>
      </div>
    </main>
  );
}
