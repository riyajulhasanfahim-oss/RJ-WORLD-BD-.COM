import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDuration?: number; // in milliseconds
}

export default function SplashScreen({ onFinish, minDuration = 2200 }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Timer to trigger fade-out
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, minDuration);

    // Timer to fully remove from DOM
    const removeTimer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, minDuration + 650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [minDuration, onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer transition-all duration-700 ease-out ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #0B1933 0%, #060D1B 55%, #030712 100%)'
      }}
    >
      {/* Background Animated Subtle Grid / Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Ambient Radial Color Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-sky-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse duration-3000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[320px] h-[220px] sm:h-[320px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Floating Ambient Light Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '20%', left: '15%', size: 4, delay: '0s', dur: '4s' },
          { top: '35%', left: '85%', size: 3, delay: '1s', dur: '5s' },
          { top: '70%', left: '20%', size: 5, delay: '2s', dur: '4.5s' },
          { top: '65%', left: '80%', size: 4, delay: '0.5s', dur: '3.5s' },
          { top: '15%', left: '75%', size: 3, delay: '1.5s', dur: '6s' },
          { top: '80%', left: '50%', size: 4, delay: '2.5s', dur: '4s' },
          { top: '25%', left: '45%', size: 2, delay: '3s', dur: '5s' },
          { top: '55%', left: '10%', size: 3, delay: '1.8s', dur: '4.8s' }
        ].map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-sky-300/40 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-float-particle"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.dur
            }}
          />
        ))}
      </div>

      {/* Center Logo Showcase Area */}
      <div className="relative flex flex-col items-center justify-center px-4">
        {/* Concentric Modern Glowing Ripple Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-sky-400/20 animate-ping-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-sky-300/30 animate-pulse-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-amber-400/25 pointer-events-none" />

        {/* Premium Glassmorphic Squircle Badge with Glowing Edge */}
        <div className="relative group">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1.5 rounded-[28px] sm:rounded-[32px] bg-gradient-to-tr from-sky-500/40 via-amber-400/30 to-blue-600/40 blur-md opacity-80 animate-pulse" />

          {/* Central Glass Container */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[26px] sm:rounded-[30px] p-3 sm:p-3.5 bg-gradient-to-b from-white/[0.14] to-white/[0.04] backdrop-blur-xl border border-white/30 shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center overflow-hidden">
            {/* Glossy Diagonal Shimmer / Light Beam */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer-sweep pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />

            {/* Official RJ WORLD BD Logo (Unchanged original asset) */}
            <img
              src="/rj-world-logo.png"
              alt="RJ WORLD BD"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.postimg.cc/02BC9ZMs/file-00000000c36881fa822edc96c75d817a.png';
              }}
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] animate-scale-reveal"
            />
          </div>
        </div>

        {/* Brand Name Typography Reveal */}
        <div className="mt-6 flex flex-col items-center text-center animate-fade-slide-up">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-white via-sky-200 to-amber-100 bg-clip-text text-transparent drop-shadow-sm font-sans">
            RJ WORLD BD
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium tracking-wide text-sky-200/80">
            E-Commerce & Reseller Marketplace
          </p>
        </div>

        {/* Modern Minimalist Loading Indicator */}
        <div className="mt-7 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce shadow-[0_0_8px_#38bdf8]" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce shadow-[0_0_8px_#f59e0b]" style={{ animationDelay: '180ms' }} />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce shadow-[0_0_8px_#3b82f6]" style={{ animationDelay: '360ms' }} />
        </div>
      </div>

      {/* Subtle Bottom Note */}
      <div className="absolute bottom-6 text-center">
        <span className="text-[11px] font-medium tracking-widest text-slate-400/60 uppercase">
          Empowering Digital Commerce
        </span>
      </div>

      {/* Inline styles for custom keyframe animations */}
      <style>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-150%) skewX(-15deg); }
          50%, 100% { transform: translateX(200%) skewX(-15deg); }
        }
        .animate-shimmer-sweep {
          animation: shimmerSweep 2.4s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes scaleReveal {
          0% { transform: scale(0.85); opacity: 0; }
          40% { transform: scale(1.04); opacity: 1; }
          70% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        .animate-scale-reveal {
          animation: scaleReveal 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes fadeSlideUp {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-slide-up {
          animation: fadeSlideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
          opacity: 0;
        }

        @keyframes floatParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-16px) scale(1.1); opacity: 0.9; }
          100% { transform: translateY(-32px) scale(0.8); opacity: 0.2; }
        }
        .animate-float-particle {
          animation: floatParticle ease-in-out infinite alternate;
        }

        @keyframes pingSlow {
          0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.5; }
          70% { transform: translate(-50%, -50%) scale(1.25); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1.25); opacity: 0; }
        }
        .animate-ping-slow {
          animation: pingSlow 2.6s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes pulseSlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.35; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.65; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
