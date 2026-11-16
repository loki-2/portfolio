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
        {/* ── Background layer (behind card content) ── */}
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
          {/* ── Very subtle dotted pattern across the entire card ── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 1.5px, transparent 1.6px)',
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0',
              opacity: isHovered ? 0.42 : 0.20,
              transition: 'opacity 0.45s ease',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* ── Top-left corner light and color gradient glow on hover ── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            {/* Luminous light flare at the top-left corner */}
            <div
              style={{
                position: 'absolute',
                top: '-8%',
                left: '-8%',
                width: '60%',
                height: '70%',
                background: `radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.22) 0%, ${hexToRgba(p, 0.42)} 22%, ${hexToRgba(p, 0.18)} 48%, transparent 75%)`,
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />

            {/* Directional light and color gradient radiating from the top-left */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(115% 95% at 0% 0%, ${hexToRgba(p, 0.30)} 0%, ${hexToRgba(s, 0.15)} 35%, ${hexToRgba(s, 0.03)} 65%, transparent 85%)`,
                pointerEvents: 'none',
              }}
            />

            {/* Crisp top-left diagonal light sheen */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, ${hexToRgba(p, 0.07)} 25%, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Legibility gradient — ensures left-side text stays crisp */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background: 'linear-gradient(to right, rgba(17,18,20,0.35) 0%, rgba(17,18,20,0.10) 45%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ── Card border layer (on top of images) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            border: `1.5px solid ${isHovered ? hexToRgba(p, 0.18) : 'rgba(255, 255, 255, 0.04)'}`,
            transition: 'border-color 0.45s ease',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        />
      </>
    );
  };
