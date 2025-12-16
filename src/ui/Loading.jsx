import React, { useState, useEffect } from "react";

export default function Loading({ open = true }) {
    if (!open) return null;

    const scenes = [
        {
            emoji: "🎬",
            hue: "from-pink-500/30 to-red-500/20",
            text: "Your PitchCraft is generating cinematic magic...",
        },
        {
            emoji: "🎥",
            hue: "from-blue-500/30 to-cyan-500/20",
            text: "Casting your story into visual brilliance...",
        },
        {
            emoji: "📽️",
            hue: "from-purple-500/30 to-indigo-500/20",
            text: "Building slides frame by frame...",
        },
        {
            emoji: "🪄",
            hue: "from-amber-500/30 to-yellow-500/20",
            text: "Composing your narrative masterpiece...",
        },
    ];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((i) => (i + 1) % scenes.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const scene = scenes[index];

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-white bg-gradient-to-b from-black/95 to-[#0d0d0d]/95 backdrop-blur-md overflow-hidden">
            {/* 3D Stage */}
            <div className="relative w-[260px] h-[220px] perspective-[900px] mb-10">

                {/* Film Reel - background layer */}
                <div className="absolute top-4 left-[33%] w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full border-[3px] border-gray-400/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] animate-spin-slow transform-gpu rotate-y-[25deg]">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 bg-black rounded-full"
                            style={{
                                top: "42%",
                                left: "42%",
                                transform: `rotate(${i * 60}deg) translate(10px, -30px)`,
                            }}
                        />
                    ))}
                </div>

                {/* Floating emoji actor */}
                <div className="absolute top-[45px] left-[61%] -translate-x-1/2 text-4xl animate-float3D drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] select-none">
                    {scene.emoji}
                </div>

                {/* Clapboard */}
                <div className="absolute bottom-8 left-[66%] -translate-x-1/2 w-20 h-12 bg-gradient-to-b from-gray-800 to-gray-900 rounded-md border border-gray-600 shadow-[0_3px_10px_rgba(0,0,0,0.7)] transform-gpu animate-clap-tilt">
                    {/* Striped Lid */}
                    <div className="absolute -top-3 left-0 w-20 h-3 rounded-sm shadow-md overflow-hidden animate-clap-lid">
                        <div className="w-full h-full bg-[repeating-linear-gradient(135deg,_#000_0px,_#000_6px,_#fff_6px,_#fff_12px)]" />
                    </div>

                    {/* Text Label */}
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] tracking-widest text-gray-400 font-semibold font-[Outfit]">
                        PITCHCRAFT
                    </div>
                </div>

                {/* Spotlight cone */}
                <div
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-32 bg-gradient-to-t ${scene.hue} blur-2xl opacity-70 animate-spotlight-glow rounded-full`}
                />

                {/* Stage ground */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[220px] h-[10px] bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)]" />
            </div>

            {/* Text Section */}
            <p className="text-lg sm:text-xl font-semibold tracking-wide text-center animate-fadeIn">
                {scene.text}
            </p>
            <p className="mt-3 text-sm sm:text-base text-gray-300 text-center max-w-md leading-relaxed animate-fadeInSlow">
                This might take <span className="font-semibold text-white">25 — 30 minutes</span>.
                <br />
                Feel free to come back soon — we're crafting your next big cinematic pitch.
            </p>

            {/* Animations */}
            <style>{`
        @keyframes spin-slow {
          0% { transform: rotateY(25deg) rotate(0deg); }
          100% { transform: rotateY(25deg) rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }

        @keyframes float3D {
          0%, 100% { transform: translate(-50%, 0) translateZ(20px) rotateY(0deg); }
          50% { transform: translate(-50%, -10px) translateZ(40px) rotateY(10deg); }
        }
        .animate-float3D { animation: float3D 3.5s ease-in-out infinite; }

        @keyframes clap-tilt {
          0%, 100% { transform: translateX(-50%) rotateX(0deg); }
          50% { transform: translateX(-50%) rotateX(5deg); }
        }
        .animate-clap-tilt { animation: clap-tilt 3s ease-in-out infinite; transform-origin: center bottom; }

        @keyframes clap-lid {
          0%, 100% { transform: rotateX(0deg); }
          50% { transform: rotateX(-20deg); }
        }
        .animate-clap-lid { animation: clap-lid 3s ease-in-out infinite; transform-origin: top center; }

        @keyframes spotlight-glow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
        .animate-spotlight-glow { animation: spotlight-glow 3s ease-in-out infinite; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-in-out; }
        .animate-fadeInSlow { animation: fadeIn 1.4s ease-in-out; }
      `}</style>
        </div>
    );
}
