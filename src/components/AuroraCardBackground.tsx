import React from 'react';

export interface AuroraTheme {
  baseBg: string;
  primaryColor: string;
  secondaryColor?: string;
  glowRgba?: string;
}

export const AURORA_THEMES: Record<number, AuroraTheme> = {
  0: {
    baseBg: '#111214',
    primaryColor: '#EDEE00',
    secondaryColor: '#b5b600',
    glowRgba: 'rgba(237, 238, 0, 0.45)',
  },
  1: {
    baseBg: '#111214',
    primaryColor: '#70d13c',
    secondaryColor: '#4ca528',
    glowRgba: 'rgba(112, 209, 60, 0.45)',
  },
  2: {
    baseBg: '#111214',
    primaryColor: '#1685C5',
    secondaryColor: '#106da3',
    glowRgba: 'rgba(22, 133, 197, 0.45)',
  },
};

function hexToRgba(color: string, alpha: number): string {
  if (!color) return `rgba(255, 255, 255, ${alpha})`;
  if (color.startsWith('rgba') || color.startsWith('hsla')) return color;
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  }
  const clean = color.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (clean.length >= 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(255, 255, 255, ${alpha})`;
}

export const AuroraCardBackground: React.FC<{
  theme?: AuroraTheme;
  isHovered?: boolean;
}> = ({
  theme = AURORA_THEMES[0],
  isHovered = false,
}) => {
    const p = theme.primaryColor;
    const s = theme.secondaryColor ?? theme.primaryColor;

    return (
      <>
        {/* ── Background layer (behind z-index: -1 images) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            borderRadius: 'inherit',
            backgroundColor: '#111214',
            zIndex: -2,
            pointerEvents: 'none',
          }}
        >
          {/* ── Subtle color background revealed on hover ── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Subtle ambient wash across the whole card */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(120% 120% at 50% 40%, ${hexToRgba(p, 0.12)} 0%, ${hexToRgba(s, 0.06)} 55%, transparent 100%)`,
              }}
            />

            {/* Moving Pool 1 — Primary color orb drifting top-left to center */}
            <div
              style={{
                position: 'absolute',
                width: '80%',
                height: '85%',
                top: '-15%',
                left: '-10%',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${hexToRgba(p, 0.26)} 0%, ${hexToRgba(p, 0.08)} 50%, transparent 75%)`,
                filter: 'blur(55px)',
                animation: 'subtle-color-move-1 12s ease-in-out infinite',
                willChange: 'transform',
              }}
            />

            {/* Moving Pool 2 — Secondary color orb drifting bottom-right */}
            <div
              style={{
                position: 'absolute',
                width: '75%',
                height: '80%',
                bottom: '-15%',
                right: '-10%',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${hexToRgba(s, 0.22)} 0%, ${hexToRgba(s, 0.06)} 50%, transparent 75%)`,
                filter: 'blur(60px)',
                animation: 'subtle-color-move-2 15s ease-in-out infinite',
                willChange: 'transform',
              }}
            />

            {/* Moving Pool 3 — Ambient center accent drift */}
            <div
              style={{
                position: 'absolute',
                width: '65%',
                height: '65%',
                top: '20%',
                left: '25%',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${hexToRgba(p, 0.18)} 0%, transparent 70%)`,
                filter: 'blur(65px)',
                animation: 'subtle-color-move-3 18s ease-in-out infinite',
                willChange: 'transform',
              }}
            />
          </div>

          {/* Legibility gradient — ensures left-side text stays crisp */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background: 'linear-gradient(to right, rgba(17,18,20,0.45) 0%, rgba(17,18,20,0.15) 45%, transparent 100%)',
            }}
          />
        </div>

        {/* ── Card border layer (on top of images) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            border: `2px solid ${isHovered ? hexToRgba(p, 0.06) : 'rgba(255, 255, 255, 0.03)'}`,
            transition: 'border-color 0.45s ease',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        />
      </>
    );
  };
