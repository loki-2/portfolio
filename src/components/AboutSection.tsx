import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';

// ─── Photo Carousel ──────────────────────────────────────────────────────────

const PHOTOS = [
  '/images/IMG_0215.jpeg',
  '/images/IMG_3584.jpeg',
  '/images/IMG_3851.jpeg',
  '/images/IMG_4499.jpeg',
  '/images/Impulse.jpeg',
  '/images/82098.jpeg',
];

const PhotoCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);
  const touchStartX = useRef(0);
  const SLIDE_DURATION = 3000; // 3 seconds per slide
  const TICK = 30; // progress update interval in ms

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % PHOTOS.length);
    setProgress(0);
  }, []);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + PHOTOS.length) % PHOTOS.length);
    setProgress(0);
  }, []);

  // Auto-advance timer (does not stop on hover)
  useEffect(() => {
    progressRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK / SLIDE_DURATION) * 100;
        if (next >= 100) {
          return 100;
        }
        return next;
      });
    }, TICK);

    intervalRef.current = window.setInterval(() => {
      goNext();
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [current, goNext]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  return (
    <div
      className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden group shadow-lg border border-white/[0.08]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      {PHOTOS.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`Photo ${idx + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: idx === current ? 1 : 0 }}
          draggable={false}
        />
      ))}

      {/* Gradient overlay at bottom for dots */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Arrow Controls (visible on hover) */}
      <button
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
        title="Previous photo"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
        title="Next photo"
      >
        <ChevronRight size={16} />
      </button>

      {/* Dots / Progress Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {PHOTOS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className="relative cursor-pointer"
            style={{ padding: '4px 0' }}
          >
            {idx === current ? (
              /* Active pill with progress */
              <div className="w-6 h-1.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-[width] ease-linear"
                  style={{
                    width: `${progress}%`,
                    transitionDuration: `${TICK}ms`,
                  }}
                />
              </div>
            ) : (
              /* Inactive dot */
              <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Weather Widget ──────────────────────────────────────────────────────────

interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
}

export const WMO_DESCRIPTIONS: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Showers', icon: '🌧️' },
  82: { label: 'Heavy showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm', icon: '⛈️' },
  99: { label: 'Heavy storm', icon: '⛈️' },
};

function getWeatherTheme(code: number, isDay: boolean = true) {
  // Clear sky
  if (code === 0 || code === 1) {
    if (isDay) {
      return {
        bg: 'bg-gradient-to-br from-[#172535] to-[#101923]',
        border: 'border-white/[0.08]',
      };
    }
    // Clear sky (Night) - Calm, muted cool slate-blue (no glow, not too bright)
    return {
      bg: 'bg-gradient-to-br from-[#15212d] to-[#0e1620]',
      border: 'border-white/[0.08]',
    };
  }

  // Partly cloudy / Overcast (codes 2, 3)
  if (code === 2 || code === 3) {
    if (isDay) {
      return {
        bg: 'bg-gradient-to-br from-[#172332] to-[#111924]',
        border: 'border-white/[0.08]',
      };
    }
    // Night partly cloudy / overcast (Bengaluru) - Calm, subtle cool slate-blue
    return {
      bg: 'bg-gradient-to-br from-[#15212d] to-[#0f1720]',
      border: 'border-white/[0.08]',
    };
  }

  // Rain / Drizzle / Showers (codes 51-67, 80-82)
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      bg: 'bg-gradient-to-br from-[#14232c] to-[#0e1920]',
      border: 'border-white/[0.08]',
    };
  }

  // Thunderstorm (codes 95-99)
  if (code >= 95 && code <= 99) {
    return {
      bg: 'bg-gradient-to-br from-[#181f30] to-[#101421]',
      border: 'border-white/[0.08]',
    };
  }

  // Default / Fog
  return {
    bg: 'bg-gradient-to-br from-[#142125] to-[#0e171b]',
    border: 'border-white/[0.08]',
  };
}

// Interactive vector weather art component with parallax and bounce
interface WeatherArtProps {
  code: number;
  isDay: boolean;
  mousePos: { x: number; y: number };
  isPuffed: boolean;
}

const InteractiveWeatherArt: React.FC<WeatherArtProps> = ({ code, isDay, mousePos, isPuffed }) => {
  // Clear sky
  if (code === 0 || code === 1) {
    if (isDay) {
      return (
        <div
          className="relative w-16 h-14 flex items-center justify-center select-none"
          style={{
            transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 8}px, 0) scale(${isPuffed ? 1.2 : 1})`,
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <svg viewBox="0 0 60 60" className="w-12 h-12 overflow-visible">
            <g className="origin-center" style={{ animation: 'spin 20s linear infinite' }}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line
                  key={deg}
                  x1="30"
                  y1="7"
                  x2="30"
                  y2="13"
                  stroke="#FBBF24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 30 30)`}
                />
              ))}
            </g>
            <circle cx="30" cy="30" r="12" fill="#FBBF24" />
          </svg>
        </div>
      );
    } else {
      return (
        <div
          className="relative w-16 h-14 flex items-center justify-center select-none"
          style={{
            transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 8}px, 0) scale(${isPuffed ? 1.2 : 1})`,
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <svg viewBox="0 0 60 60" className="w-12 h-12 overflow-visible">
            <circle cx="44" cy="18" r="1.5" fill="#E2E8F0" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="48" cy="34" r="1" fill="#94A3B8" />
            <circle cx="18" cy="46" r="1" fill="#64748B" opacity="0.6" />
            <path
              d="M36 14 C24 14 16 23 16 34 C16 45 25 52 36 50 C28 47 24 38 25 28 C26 21 30 16 36 14 Z"
              fill="url(#moonGrad)"
            />
            <defs>
              <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );
    }
  }

  // Rain / Showers
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return (
      <div
        className="relative w-18 h-14 select-none"
        style={{
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 8}px, 0) scale(${isPuffed ? 1.15 : 1})`,
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <svg viewBox="0 0 76 54" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="rainCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          <path
            d="M18 32 C12 32 8 27 9 22 C10 17 15 14 20 14 C22 9 28 5 36 6 C43 7 48 11 50 16 C54 15 59 18 60 22 C64 24 65 28 62 31 C60 32 57 32 54 32 L18 32 Z"
            fill="url(#rainCloudGrad)"
            filter="drop-shadow(0px 2px 5px rgba(0,0,0,0.18))"
          />
          <g>
            <line x1="24" y1="38" x2="21" y2="46" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
            <line x1="36" y1="39" x2="33" y2="48" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
            <line x1="48" y1="38" x2="45" y2="46" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
          </g>
        </svg>
      </div>
    );
  }

  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return (
      <div
        className="relative w-18 h-14 select-none"
        style={{
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 8}px, 0) scale(${isPuffed ? 1.15 : 1})`,
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <svg viewBox="0 0 76 54" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="stormCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="60%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
          <path
            d="M18 30 C12 30 8 25 9 20 C10 15 15 12 20 12 C22 7 28 3 36 4 C43 5 48 9 50 14 C54 13 59 16 60 20 C64 22 65 26 62 29 C60 30 57 30 54 30 L18 30 Z"
            fill="url(#stormCloudGrad)"
            filter="drop-shadow(0px 2px 5px rgba(0,0,0,0.22))"
          />
          <polygon
            points="34,28 27,39 33,39 29,48 41,36 34,36"
            fill="#FACC15"
            className="animate-pulse"
            style={{ filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.8))' }}
          />
        </svg>
      </div>
    );
  }

  // Partly Cloudy & Overcast (codes 2, 3) + Default:
  // Interactive dual-layer clouds with parallax, celestial peek & bounce
  return (
    <div
      className="relative w-20 h-14 select-none flex items-center justify-center cursor-pointer"
      style={{
        transform: `scale(${isPuffed ? 1.15 : 1})`,
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <svg viewBox="0 0 88 56" className="w-full h-full overflow-visible">
        <defs>
          {/* Front Cloud gradient: crisp luminous white to soft cloud tone */}
          <linearGradient id="cloudGradFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="55%" stopColor="#F8FAFC" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.95" />
          </linearGradient>

          {/* Back Cloud gradient: soft luminous sky glow */}
          <linearGradient id="cloudGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.45" />
          </linearGradient>

          <filter id="cloudSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Peeking Sun or Moon */}
        {isDay ? (
          <circle
            cx="26"
            cy="16"
            r="8"
            fill="#FBBF24"
            style={{
              transform: `translate3d(${mousePos.x * 4}px, ${mousePos.y * 3}px, 0)`,
              transition: 'transform 0.2s ease-out',
            }}
          />
        ) : (
          <circle
            cx="28"
            cy="16"
            r="7"
            fill="#CBD5E1"
            style={{
              transform: `translate3d(${mousePos.x * 4}px, ${mousePos.y * 3}px, 0)`,
              transition: 'transform 0.2s ease-out',
            }}
          />
        )}

        {/* Back Cloud with subtle counter-parallax */}
        <g
          style={{
            transform: `translate3d(${mousePos.x * -7}px, ${mousePos.y * -4}px, 0)`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          <path
            d="M32 30 C32 23 37 19 43 19 C46 15 52 13 58 16 C63 13 69 15 71 20 C76 21 78 26 77 31 C75 35 71 37 67 37 L34 37 C29 37 27 34 28 31 C29 30 30 30 32 30 Z"
            fill="url(#cloudGradBack)"
          />
        </g>

        {/* Front Cloud with parallax movement & specular highlight */}
        <g
          filter="url(#cloudSoftShadow)"
          style={{
            transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 8}px, 0)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          <path
            d="M16 40 C11 40 7 36 8 30 C9 25 13 22 18 22 C20 16 26 12 34 13 C40 14 45 18 47 23 C50 22 55 24 56 28 C60 30 61 35 58 38 C56 40 53 40 50 40 L16 40 Z"
            fill="url(#cloudGradFront)"
          />
          {/* Specular highlight ridge on top of front cloud */}
          <path
            d="M20 22 C22 17 27 14 34 14 C39 15 43 18 45 23"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
};



// ─── Weather Ambient Sound Engine (Web Audio API) ───────────────────────────

class WeatherSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private cleanupTimeout: number | null = null;
  private nodesToStop: { stop?: () => void; disconnect: () => void }[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => { });
    }
    return this.ctx;
  }

  play(code: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
      this.cleanupTimeout = null;
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Create master gain for smooth fade in/out
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.connect(ctx.destination);
    this.masterGain = master;
    this.nodesToStop = [];

    // Rain / Drizzle / Showers (codes 51-67, 80-82)
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      const bufSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      noise.connect(filter);
      filter.connect(master);
      noise.start();

      this.nodesToStop.push(noise, filter);
      master.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 0.6);
      return;
    }

    // Thunderstorm (codes 95-99)
    if (code >= 95 && code <= 99) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(45, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(90, ctx.currentTime);

      osc.connect(filter);
      filter.connect(master);
      osc.start();

      this.nodesToStop.push(osc, filter);
      master.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.5);
      return;
    }

    // Clear sky (codes 0, 1) -> Celestial warm harmonic chord
    if (code === 0 || code === 1) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(528, ctx.currentTime); // 528 Hz peaceful Solfeggio tone
      osc2.frequency.setValueAtTime(792, ctx.currentTime); // Harmonic fifth

      const gainChord = ctx.createGain();
      gainChord.gain.setValueAtTime(0.02, ctx.currentTime);

      osc1.connect(gainChord);
      osc2.connect(gainChord);
      gainChord.connect(master);

      osc1.start();
      osc2.start();

      this.nodesToStop.push(osc1, osc2, gainChord);
      master.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.8);
      return;
    }

    // Partly Cloudy / Overcast (codes 2, 3) + Default -> Gentle atmospheric breeze
    // Pink/brown noise passed through lowpass filter modulated by gentle breathing LFO
    const bufSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Leaky integrator brown noise
      lastOut = data[i];
      data[i] *= 2.8;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, ctx.currentTime);
    filter.Q.setValueAtTime(2.0, ctx.currentTime);

    // Subtle breathing LFO for realistic gentle blowing wind gusts
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.25, ctx.currentTime);
    lfoGain.gain.setValueAtTime(140, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(master);

    noise.start();
    lfo.start();

    this.nodesToStop.push(noise, filter, lfo, lfoGain);
    master.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 0.7);
  }

  stop() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    this.isPlaying = false;
    const master = this.masterGain;
    const now = this.ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.5);

    const nodes = this.nodesToStop;
    this.cleanupTimeout = window.setTimeout(() => {
      try {
        nodes.forEach((n) => {
          if (n.stop) n.stop();
          n.disconnect();
        });
        master.disconnect();
      } catch (e) { }
    }, 600);
  }
}

const weatherSoundEngine = new WeatherSoundEngine();

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPuffed, setIsPuffed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSoundActive, setIsSoundActive] = useState(false);

  useEffect(() => {
    // Open-Meteo: free, no API key, Bengaluru coordinates
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,is_day&timezone=Asia/Kolkata'
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.current) {
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code,
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            isDay: data.current.is_day === 1,
          });
        }
      })
      .catch((err) => console.error('Weather fetch error:', err));

    return () => {
      weatherSoundEngine.stop();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!isMuted && weather) {
      weatherSoundEngine.play(weather.weatherCode);
      setIsSoundActive(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
    weatherSoundEngine.stop();
    setIsSoundActive(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      setIsMuted(false);
      if (isHovered && weather) {
        weatherSoundEngine.play(weather.weatherCode);
        setIsSoundActive(true);
      }
    } else {
      setIsMuted(true);
      weatherSoundEngine.stop();
      setIsSoundActive(false);
    }
  };

  const handleClick = () => {
    setIsPuffed(true);
    setTimeout(() => setIsPuffed(false), 350);
  };

  const theme = weather ? getWeatherTheme(weather.weatherCode, weather.isDay) : null;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`flex flex-col justify-between h-full rounded-2xl p-5 min-h-[160px] relative overflow-hidden transition-all duration-300 cursor-pointer group border ${theme
        ? `${theme.bg} ${theme.border}`
        : 'bg-white/[0.03] border-white/[0.05]'
        } hover:border-white/15`}
    >
      {/* Ambient hover weather effect (smooth fade in/out over whole card) */}
      {weather && (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-700 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Cloudy / Overcast (codes 2, 3 or default): Soft clouds gently drift left to right */}
          {weather.weatherCode !== 0 &&
            weather.weatherCode !== 1 &&
            !(weather.weatherCode >= 51 && weather.weatherCode <= 67) &&
            !(weather.weatherCode >= 80 && weather.weatherCode <= 82) &&
            !(weather.weatherCode >= 95 && weather.weatherCode <= 99) && (
              <>
                {/* Upper Cloud drifting left to right */}
                <div
                  className="absolute top-1 left-0 w-[220px]"
                  style={{
                    animation: 'weather-cloud-drift-1 18s linear infinite -6s',
                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))',
                  }}
                >
                  <svg width="220" height="90" viewBox="0 0 220 90" fill="none">
                    <path
                      d="M40 70 C22 70 10 58 15 44 C19 32 32 26 44 27 C50 16 64 8 80 10 C96 12 106 20 110 30 C118 26 130 28 134 36 C144 38 150 46 146 56 C142 63 132 70 122 70 Z"
                      fill="url(#ambientCloudGradA)"
                    />
                    <path
                      d="M52 28 C64 12 78 10 94 12 C104 14 110 20 112 28"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                    <defs>
                      <linearGradient id="ambientCloudGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.20" />
                        <stop offset="60%" stopColor="#E0F2FE" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Lower Cloud drifting left to right */}
                <div
                  className="absolute bottom-[-6px] left-0 w-[250px]"
                  style={{
                    animation: 'weather-cloud-drift-2 16s linear infinite -11s',
                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))',
                  }}
                >
                  <svg width="250" height="105" viewBox="0 0 250 105" fill="none">
                    <path
                      d="M48 85 C26 85 10 72 16 54 C20 40 36 34 50 35 C58 20 76 10 96 12 C116 15 128 26 132 38 C142 34 154 37 158 46 C168 49 174 58 170 69 C166 77 155 85 142 85 Z"
                      fill="url(#ambientCloudGradB)"
                    />
                    <path
                      d="M60 22 C76 12 94 12 114 15 C124 17 130 24 132 34"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.25"
                    />
                    <defs>
                      <linearGradient id="ambientCloudGradB" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                        <stop offset="55%" stopColor="#E0F2FE" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </>
            )}

          {/* Rain / Showers (codes 51-67, 80-82) */}
          {((weather.weatherCode >= 51 && weather.weatherCode <= 67) ||
            (weather.weatherCode >= 80 && weather.weatherCode <= 82)) && (
              <div className="absolute inset-0">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-[1.5px] h-6 bg-cyan-200/40 rounded-full"
                    style={{
                      left: `${i * 10 + 4}%`,
                      animation: `weather-raindrop ${0.7 + (i % 4) * 0.2}s linear infinite ${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
        </div>
      )}

      {weather && theme ? (
        <>
          <div className="flex items-start justify-between z-10 relative">
            {/* Location & Temperature in °C */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] uppercase tracking-widest font-medium text-white/50">Bengaluru</span>
              <div className="flex items-baseline mt-1.5">
                <span className="text-3xl font-semibold leading-none text-white tracking-tight">
                  {weather.temperature}
                </span>
                <span className="text-xl font-medium text-white/60 ml-0.5">°C</span>
              </div>
            </div>

            {/* Interactive Weather Art (Clouds / Sun / Moon) */}
            <div className="flex items-center justify-center">
              <InteractiveWeatherArt
                code={weather.weatherCode}
                isDay={weather.isDay}
                mousePos={mousePos}
                isPuffed={isPuffed}
              />
            </div>
          </div>

          {/* Bottom stats & sound toggle */}
          <div className="flex items-center justify-between text-xs mt-auto pt-3 z-10 relative">
            <div className="flex items-center gap-3 text-white/50">
              <span className="flex items-center gap-1.5">💧 {weather.humidity}%</span>
              <span className="flex items-center gap-1.5">💨 {weather.windSpeed} km/h</span>
            </div>

            {/* Subtle ambient sound toggle / status */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Weather audio muted (click to unmute)' : 'Ambient weather sound (click to mute)'}
              className="p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1"
            >
              {isMuted ? (
                <VolumeX size={13} className="text-white/30" />
              ) : (
                <div className="flex items-center gap-1">
                  <Volume2 size={13} className={isSoundActive ? 'text-sky-300' : 'text-white/40'} />
                  {isSoundActive && (
                    <span className="flex items-center gap-0.5 h-2">
                      <span className="w-0.5 h-1.5 bg-sky-300/90 rounded-full animate-pulse" />
                      <span className="w-0.5 h-2.5 bg-sky-300/90 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-1 bg-sky-300/90 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// ─── Location & Analog Time Widget ───────────────────────────────────────────

// ─── Clock Tick Sound Engine (Web Audio API) ──────────────────────────────────
class ClockSoundEngine {
  private ctx: AudioContext | null = null;
  private isTick = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => { });
    }
    return this.ctx;
  }

  playTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Escapement mechanical click: bandpass noise + tiny triangle transient
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(this.isTick ? 3400 : 2600, now);
    filter.Q.setValueAtTime(4.5, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.isTick ? 1800 : 1300, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.012);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.018);

    // Subtle metallic body resonance
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(this.isTick ? 880 : 720, now);

    bodyGain.gain.setValueAtTime(0.02, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.028);

    this.isTick = !this.isTick;
  }
}

const clockSoundEngine = new ClockSoundEngine();

const LocationTimeWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      if (isHoveredRef.current) {
        clockSoundEngine.playTick();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    clockSoundEngine.playTick();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  // IST = UTC + 5:30
  const istTime = new Date(time.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const seconds = istTime.getSeconds();

  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  return (
    <div
      onMouseEnter={isTouchDevice ? undefined : handleMouseEnter}
      onMouseLeave={isTouchDevice ? undefined : handleMouseLeave}
      onClick={isTouchDevice ? () => clockSoundEngine.playTick() : undefined}
      className={`flex flex-col justify-between h-full rounded-2xl p-5 min-h-[160px] relative overflow-hidden group cursor-pointer transition-all duration-300 border ${isHovered
        ? 'bg-white/[0.045] border-white/10 shadow-lg shadow-black/20'
        : 'bg-white/[0.03] border-white/[0.05]'
        }`}
    >
      {/* Header: Centered India */}
      <div className="flex items-center justify-center gap-1.5 text-white/40 z-10 w-full">
        {/* <MapPin size={12} className="text-white/50" /> */}
        <span className="text-[11px] uppercase tracking-widest font-medium text-white/50">India</span>
      </div>

      {/* Centered Analog Clock Face with increased radius */}
      <div className="flex-1 flex items-center justify-center py-3 z-10">
        <div className="relative w-24 h-24 sm:w-[106px] sm:h-[106px]">
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-md">
            {/* Clock dial background */}
            <circle cx="40" cy="40" r="37" fill="#15171B" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

            {/* Hour ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
              const isMajor = deg % 90 === 0;
              return (
                <line
                  key={deg}
                  x1="40"
                  y1={isMajor ? '8' : '9'}
                  x2="40"
                  y2={isMajor ? '13' : '11'}
                  stroke={isMajor ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isMajor ? '2' : '1'}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 40 40)`}
                />
              );
            })}

            {/* Hour Hand */}
            <line
              x1="40"
              y1="40"
              x2="40"
              y2="22"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              transform={`rotate(${hourAngle} 40 40)`}
            />

            {/* Minute Hand */}
            <line
              x1="40"
              y1="40"
              x2="40"
              y2="14"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1.75"
              strokeLinecap="round"
              transform={`rotate(${minuteAngle} 40 40)`}
            />

            {/* Second Hand (Orange/Accent with counterweight) */}
            <line
              x1="40"
              y1="46"
              x2="40"
              y2="10"
              stroke="#FF6B4A"
              strokeWidth="1.2"
              strokeLinecap="round"
              transform={`rotate(${secondAngle} 40 40)`}
            />

            {/* Center Pin */}
            <circle cx="40" cy="40" r="2.5" fill="#FF6B4A" />
            <circle cx="40" cy="40" r="1" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ─── Music Player Card (CD Player UI, No Progress Bar) ────────────────────────

interface iTunesTrack {
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackViewUrl: string;
}

const TRACK_IDS = [
  '1615142635', // Where Is the Love? - The Black Eyed Peas
  '1850019038', // About You - The 1975
  '1870984033', // Aperture - Harry Styles
  '1871595253', // Homewrecker - sombr
];

const INITIAL_TRACKS: iTunesTrack[] = [
  {
    trackName: 'Where Is the Love?',
    artistName: 'The Black Eyed Peas',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bf/13/26/bf132644-8cb3-356a-1e35-513470b138ff/06UMGIM08920.rgb.jpg/300x300bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/e5/2d/a9/e52da914-5f56-550f-21f4-3453b6cb5dc8/mzaf_10023418520338786968.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/in/album/where-is-the-love/1615142131?i=1615142635',
  },
  {
    trackName: 'About You',
    artistName: 'The 1975',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/7c/4f/2d/7c4f2d72-b7a4-e9ca-9a67-6ee089a871d3/22UMGIM70020.rgb.jpg/300x300bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/f2/87/05/f28705c7-9576-96b6-3a72-e1f40d7c71ba/mzaf_613955677051390449.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/in/album/about-you/1850018862?i=1850019038',
  },
  {
    trackName: 'Aperture',
    artistName: 'Harry Styles',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/b8/b8/b7/b8b8b725-b1a6-89ec-9e0a-b5ea5b349079/886449942475.jpg/300x300bb.jpg',
    previewUrl: '',
    trackViewUrl: 'https://music.apple.com/in/album/aperture/1870984032?i=1870984033',
  },
  {
    trackName: 'Homewrecker',
    artistName: 'sombr',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7b/72/77/7b727788-b715-e215-6bb9-ebcba6e7041a/093624838630.jpg/300x300bb.jpg',
    previewUrl: '',
    trackViewUrl: 'https://music.apple.com/in/album/homewrecker/1871595252?i=1871595253',
  },
];

const SONG_VOLUME = 0.20; // 20% volume for comfortable listening, balanced with ambient weather audio

const MusicPlayerCard: React.FC = () => {
  const [tracks, setTracks] = useState<iTunesTrack[]>(INITIAL_TRACKS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    const ids = TRACK_IDS.join(',');
    const itunesUrl =
      window.location.hostname === 'localhost'
        ? `https://itunes.apple.com/lookup?id=${ids}`
        : `/.netlify/functions/itunes?id=${ids}`;

    fetch(itunesUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          const validTracks = data.results.filter((r: any) => r.kind === 'song' || r.previewUrl);
          setTracks(validTracks.length > 0 ? validTracks : [data.results[0]]);
        }
      })
      .catch((err) => console.error('Error fetching tracks:', err));
  }, []);

  const track = tracks[currentIdx] || null;

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!audioRef.current || !track) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = SONG_VOLUME;
      audioRef.current.play().catch((e) => console.error(e));
    }
  }, [isPlaying, track]);

  const playNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tracks.length === 0) return;
    wasPlayingRef.current = isPlaying;
    if (audioRef.current) audioRef.current.pause();
    setCurrentIdx((prev) => (prev + 1) % tracks.length);
  }, [tracks, isPlaying]);

  const playPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tracks.length === 0) return;
    wasPlayingRef.current = isPlaying;
    if (audioRef.current) audioRef.current.pause();
    setCurrentIdx((prev) => (prev - 1 + tracks.length) % tracks.length);
  }, [tracks, isPlaying]);

  // Track change handler
  useEffect(() => {
    if (!audioRef.current || !track) return;
    audioRef.current.src = track.previewUrl;
    audioRef.current.volume = SONG_VOLUME;
    audioRef.current.load();
    if (wasPlayingRef.current) {
      audioRef.current.play().catch((e) => console.error(e));
    }
  }, [currentIdx, track]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.volume = SONG_VOLUME;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (tracks.length > 1) {
        wasPlayingRef.current = true;
        setCurrentIdx((prev) => (prev + 1) % tracks.length);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [tracks, currentIdx]);

  // Desktop: play on hover, pause on leave
  const handleMouseEnter = () => {
    if (audioRef.current && track && !isPlaying) {
      audioRef.current.volume = SONG_VOLUME;
      audioRef.current.play().catch(() => { });
    }
  };
  const handleMouseLeave = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  };

  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  if (!track) {
    return (
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 animate-pulse min-h-[140px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/[0.06]" />
          <div className="flex flex-col gap-1.5">
            <div className="w-24 h-3 bg-white/[0.06] rounded" />
            <div className="w-16 h-2 bg-white/[0.06] rounded" />
          </div>
        </div>
      </div>
    );
  }

  const highResArtwork = track.artworkUrl100.replace('100x100bb.jpg', '300x300bb.jpg');

  return (
    <div
      className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5 flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all duration-300 hover:border-white/10 cursor-pointer"
      onMouseEnter={isTouchDevice ? undefined : handleMouseEnter}
      onMouseLeave={isTouchDevice ? undefined : handleMouseLeave}
      onClick={isTouchDevice ? () => togglePlay() : undefined}
    >
      <audio ref={audioRef} preload="auto" />

      {/* Blurred album artwork behind CD for authentic song-based ambient glow on hover (reduced opacity) */}
      <div className="absolute -right-12 sm:-right-10 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-52 sm:h-52 rounded-full overflow-hidden blur-2xl opacity-0 group-hover:opacity-35 transition-opacity duration-500 pointer-events-none">
        <img
          src={highResArtwork}
          alt=""
          className="w-full h-full object-cover scale-125"
        />
      </div>

      {/* Left side content: Header, Track info, and Controls */}
      <div className="flex flex-col justify-between h-full z-10 max-w-[62%] sm:max-w-[65%] min-w-0 pr-2">
        <span className="text-[11px] uppercase tracking-widest text-white/30 font-medium">Vibing to</span>

        <div className="flex flex-col gap-0.5 mt-2 min-w-0">
          <h4 className="text-sm sm:text-[15px] font-semibold text-white truncate leading-tight">
            {track.trackName}
          </h4>
          <p className="text-xs text-white/40 truncate">{track.artistName}</p>
        </div>

        {/* Controls: Prev, Play, Next */}
        <div className="flex items-center gap-2 mt-auto pt-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={playPrev}
            className="w-7 h-7 rounded-full bg-white/[0.06] text-white/60 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Previous track"
          >
            <SkipBack size={12} fill="currentColor" />
          </button>
          <button
            onClick={(e) => togglePlay(e)}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={14} fill="black" /> : <Play size={14} fill="black" className="ml-0.5" />}
          </button>
          <button
            onClick={playNext}
            className="w-7 h-7 rounded-full bg-white/[0.06] text-white/60 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Next track"
          >
            <SkipForward size={12} fill="currentColor" />
          </button>

          {isPlaying && (
            <div className="flex items-end gap-[2px] h-3 ml-1.5 pointer-events-none">
              <div className="bg-white/80 animate-bar-1" style={{ width: '2px' }} />
              <div className="bg-white/80 animate-bar-2" style={{ width: '2px' }} />
              <div className="bg-white/80 animate-bar-3" style={{ width: '2px' }} />
            </div>
          )}
        </div>
      </div>

      {/* Right side: Large CD disc protruding like an arc with realistic black grooved lines */}
      <div className="absolute -right-14 sm:-right-12 top-1/2 -translate-y-1/2 w-40 h-40 sm:w-44 sm:h-44 rounded-full shrink-0 select-none transition-transform duration-500 group-hover:scale-105 pointer-events-none z-0">
        {/* Spinning Disc */}
        <div
          className="w-full h-full rounded-full relative overflow-hidden bg-[#0B0C0E] border border-white/15 shadow-2xl"
          style={{
            animation: isPlaying ? 'spin 7s linear infinite' : 'none',
          }}
        >
          {/* Black concentric CD groove lines */}
          <div className="absolute inset-2 rounded-full border border-white/[0.08]" />
          <div className="absolute inset-3.5 rounded-full border border-black/90 shadow-[inset_0_0_1px_rgba(255,255,255,0.05)]" />
          <div className="absolute inset-5 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-6.5 rounded-full border border-black/90" />
          <div className="absolute inset-8 rounded-full border border-white/[0.05]" />
          <div className="absolute inset-10 rounded-full border border-black/90" />
          <div className="absolute inset-12 rounded-full border border-white/[0.04]" />
          <div className="absolute inset-14 rounded-full border border-black/95" />

          {/* Holographic / sheen iridescent sweep */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.09) 45deg, transparent 90deg, rgba(255,255,255,0.06) 180deg, transparent 225deg, rgba(255,255,255,0.09) 270deg, transparent 315deg)',
            }}
          />

          {/* Center Album Art Label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/20 shadow-md">
            <img src={highResArtwork} alt={track.trackName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Center Spindle Hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#111214] border border-white/30 shadow-inner z-20" />
        </div>
      </div>
    </div>
  );
};

// ─── Books Section (Real Book Covers Infinite Marquee) ───────────────────────

const BOOKS_DATA = [
  { title: 'Zero to One', author: 'Peter Thiel', cover: '/books/zero-to-one.jpg' },
  { title: 'The Hard Thing About Hard Things', author: 'Ben Horowitz', cover: '/books/hard-things.jpg' },
  { title: 'Blue Ocean Strategy', author: 'W. Chan Kim & Renée Mauborgne', cover: '/books/blue-ocean.jpg' },
  { title: 'The Almanack of Naval Ravikant', author: 'Eric Jorgenson', cover: '/books/naval-almanack.jpg' },
  { title: 'Lean Analytics', author: 'Alistair Croll (O’Reilly)', cover: '/books/lean-analytics.jpg' },
];

const BooksCarousel: React.FC = () => {
  // Duplicate array 3 times (15 items) for a continuous, seamless marquee loop
  const booksList = [...BOOKS_DATA, ...BOOKS_DATA, ...BOOKS_DATA];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5 flex flex-col justify-between min-h-[160px] overflow-hidden group">
      {/* Header */}
      <span className="text-[11px] uppercase tracking-widest text-white/30 font-medium">Books i've read</span>

      {/* Marquee track of book covers with gradient edge masks */}
      <div
        className="relative w-full overflow-hidden mt-3 py-1"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      >
        <div className="animate-marquee-left flex items-center gap-3.5 w-max group-hover:[animation-play-state:paused]">
          {booksList.map((book, idx) => (
            <div
              key={idx}
              title={`${book.title} — ${book.author}`}
              className="w-13 h-[74px] sm:w-14 sm:h-20 rounded-[6px] border border-white/10 shadow-md shadow-black/50 shrink-0 relative overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-xl hover:border-white/30 cursor-pointer select-none bg-neutral-900 group/book"
            >
              <img
                src={book.cover}
                alt={book.title}
                loading="eager"
                className="w-full h-full object-cover object-center pointer-events-none select-none rounded-[5px]"
              />
              {/* Book spine crease line & inner shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-white/20 pointer-events-none" />
              {/* Paper surface sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── About Section Export ────────────────────────────────────────────────────

export const AboutSection: React.FC = () => {
  return (
    <div className="bg-[#111214] rounded-xl p-5 sm:p-7 lg:p-12 flex flex-col gap-6 sm:gap-8 lg:gap-10">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight">About</h2>

      {/* Bento Grid Container */}
      <div className="flex flex-col gap-5 lg:gap-6">
        {/* Row 1: Photo carousel (left) + [3 paragraphs + Weather & Time] (right) */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          {/* Left: Photo carousel */}
          <div className="w-full lg:w-[38%] shrink-0">
            <PhotoCarousel />
          </div>

          {/* Right: 3 paragraphs + below them Weather and Time widgets */}
          <div className="w-full lg:flex-1 flex flex-col justify-between gap-5 lg:gap-6">
            {/* 3 Plain paragraphs */}
            <div className="flex flex-col gap-4 text-sm lg:text-[15px] text-white/70 leading-relaxed pt-1">
              <p>
                I enjoy turning ideas into products, launching personal projects and learning by building.
              </p>
              <p>
                I share my learnings on LinkedIn about product design, AI, startups, and the lessons I pick up while building.
              </p>
              <p>
                When I'm not designing, you'll usually find me playing football or listening to music.
              </p>
            </div>

            {/* Below 3 paras: Weather + Location/Time (compact clock card) */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-5 lg:gap-6">
              <WeatherWidget />
              <LocationTimeWidget />
            </div>
          </div>
        </div>

        {/* Row 2: Vibing to (Music Player with CD) + Books (side-by-side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          <MusicPlayerCard />
          <BooksCarousel />
        </div>
      </div>
    </div>
  );
};
