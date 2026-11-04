import React from 'react';
import type { AuroraTheme } from './AuroraCardBackground';

interface StarGlowCardBackgroundProps {
  theme?: AuroraTheme;
  index?: number;
}

// Deterministic pseudo-random star positions (LCG) — no re-render drift
function generateStars(count: number, seed: number) {
  const stars: { x: number; y: number; r: number; opacity: number; delay: number }[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const x = ((s >>> 16) & 0xffff) / 0xffff;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const y = ((s >>> 16) & 0xffff) / 0xffff;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const r = 0.4 + (((s >>> 16) & 0xffff) / 0xffff) * 1.0;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const opacity = 0.3 + (((s >>> 16) & 0xffff) / 0xffff) * 0.55;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const delay = (((s >>> 16) & 0xffff) / 0xffff) * 4;
    stars.push({ x: x * 100, y: y * 100, r, opacity, delay });
  }
  return stars;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const StarGlowCardBackground: React.FC<StarGlowCardBackgroundProps> = ({
  theme,
  index = 0,
}) => {
  const baseBg = '#111214';
  const primaryColor = theme?.primaryColor ?? '#1685C5';
  const secondaryColor = theme?.secondaryColor ?? '#106da3';
  const glowRgba = theme?.glowRgba ?? 'rgba(22, 133, 197, 0.45)';

  const stars = generateStars(42, index * 999983 + 7);

  const nebulaColor = hexToRgba(primaryColor, 0.14);
  const nebulaColor2 = hexToRgba(secondaryColor, 0.08);
  const shimmerColor = glowRgba.replace(/[\d.]+\)$/, '0.11)');

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl z-0"
      style={{ backgroundColor: baseBg }}
    >
      {/* ── Always-visible top-right glow orb ── */}
      <div
        className="absolute -top-16 -right-16 w-[55%] h-[55%] rounded-full blur-[90px] opacity-28 group-hover:opacity-58 transition-opacity duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 70% 30%, ${primaryColor}, ${secondaryColor} 55%, transparent 80%)`,
        }}
      />

      {/* Tight accent orb — tighter top-right corner */}
      <div
        className="absolute -top-8 -right-8 w-[30%] h-[30%] rounded-full blur-[55px] opacity-18 group-hover:opacity-42 transition-opacity duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 60% 20%, ${primaryColor}, transparent 70%)`,
        }}
      />

      {/* ── Nebula veil — fades in on hover ── */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 85% 10%, ${nebulaColor}, transparent 65%),
            radial-gradient(ellipse 40% 35% at 100% 0%, ${nebulaColor2}, transparent 70%)
          `,
        }}
      />

      {/* ── Twinkling star cluster (top-right weighted) ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {stars.map((star, i) => {
          // Bias stars toward top-right quadrant
          const cx = 100 - Math.pow(1 - star.x / 100, 0.5) * 100;
          const cy = Math.pow(star.y / 100, 0.5) * 100;
          return (
            <circle
              key={i}
              cx={`${cx}%`}
              cy={`${cy}%`}
              r={star.r}
              fill="white"
              style={{
                opacity: star.opacity,
                animation: `sg-twinkle ${1.8 + (i % 7) * 0.4}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          );
        })}
      </svg>

      {/* Coloured shimmer over star cluster on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
        style={{
          background: `radial-gradient(ellipse 45% 40% at 90% 5%, ${shimmerColor}, transparent 70%)`,
        }}
      />

      {/* Legibility vignettes */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111214]/95 via-[#111214]/30 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111214]/60 z-[1]" />
    </div>
  );
};
