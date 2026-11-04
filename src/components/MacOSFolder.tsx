import React, { type ReactNode } from 'react';

interface MacOSFolderProps {
  children: ReactNode;
  label?: string;
  icon?: ReactNode;
  className?: string;
}

export const MacOSFolder: React.FC<MacOSFolderProps> = ({
  children,
  label = 'Folder',
  icon,
  className = '',
}) => {
  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* SVG-based folder shape container */}
      <svg
        className="w-full h-auto"
        viewBox="0 0 400 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 20px 60px rgba(0, 0, 0, 0.7))' }}
      >
        <defs>
          {/* Gradient for folder tab */}
          <linearGradient id="tabGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#33333a" />
            <stop offset="100%" stopColor="#2d2d34" />
          </linearGradient>

          {/* Gradient for back panel (translucent) */}
          <linearGradient id="backPanelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(28, 28, 34, 0.5)" />
            <stop offset="100%" stopColor="rgba(24, 24, 30, 0.5)" />
          </linearGradient>

          {/* Gradient for front panel */}
          <linearGradient id="frontPanelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2f2f36" />
            <stop offset="50%" stopColor="#2a2a30" />
            <stop offset="100%" stopColor="#26262c" />
          </linearGradient>

          {/* Radial gradient for front panel depth */}
          <radialGradient id="depthGradient" cx="50%" cy="15%" r="70%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.05)" />
            <stop offset="65%" stopColor="transparent" />
          </radialGradient>

          {/* Filter for backdrop blur effect */}
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Folder Tab - Small rounded pill at top */}
        <g>
          {/* Tab shape using continuous rounded rectangle approximation */}
          <path
            d="M 150 5
               C 150 2.238 152.238 0 155 0
               L 245 0
               C 247.762 0 250 2.238 250 5
               L 250 20
               C 250 22.762 247.762 25 245 25
               L 155 25
               C 152.238 25 150 22.762 150 20
               Z"
            fill="url(#tabGradient)"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
            }}
          />

          {/* Subtle highlight on tab */}
          <path
            d="M 155 2 L 245 2 C 246.657 2 248 3.343 248 5 L 248 6 C 248 4.343 246.657 3 245 3 L 155 3 C 153.343 3 152 4.343 152 6 L 152 5 C 152 3.343 153.343 2 155 2 Z"
            fill="rgba(255, 255, 255, 0.08)"
          />
        </g>

        {/* Back Panel - Translucent rounded top, where content peeks through */}
        <g>
          {/* Back panel shape with macOS-style rounded corners */}
          <path
            d="M 30 50
               C 30 35.088 42.088 23 57 23
               L 343 23
               C 357.912 23 370 35.088 370 50
               L 370 340
               L 30 340
               Z"
            fill="url(#backPanelGradient)"
            filter="url(#blur)"
            style={{
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Inner shadow at top for depth */}
          <path
            d="M 57 23 L 343 23 C 357.912 23 370 35.088 370 50 L 370 60 L 30 60 L 30 50 C 30 35.088 42.088 23 57 23 Z"
            fill="rgba(0, 0, 0, 0.1)"
          />
        </g>

        {/* Front Panel - Solid curved front with pronounced bottom rounding */}
        <g>
          {/* Main front panel with macOS-style curves */}
          <path
            d="M 20 310
               C 20 304.477 24.477 300 30 300
               L 370 300
               C 375.523 300 380 304.477 380 310
               L 380 510
               C 380 529.33 364.33 545 345 545
               L 55 545
               C 35.67 545 20 529.33 20 510
               Z"
            fill="url(#frontPanelGradient)"
            style={{
              filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5))',
            }}
          />

          {/* Top edge highlight */}
          <path
            d="M 30 301 L 370 301 C 374.971 301 379 305.029 379 310 L 379 312 C 379 307.029 374.971 303 370 303 L 30 303 C 25.029 303 21 307.029 21 312 L 21 310 C 21 305.029 25.029 301 30 301 Z"
            fill="rgba(255, 255, 255, 0.04)"
          />

          {/* Subtle center highlight gradient */}
          <ellipse
            cx="200"
            cy="360"
            rx="140"
            ry="65"
            fill="url(#depthGradient)"
          />

          {/* Left edge subtle highlight */}
          <path
            d="M 21 310 C 21 305.029 25.029 301 30 301 L 32 301 C 26.477 301 22 305.477 22 310 L 22 510 C 22 528.778 36.222 543 55 543 L 53 543 C 34.222 543 20 528.778 20 510 L 20 310 Z"
            fill="rgba(255, 255, 255, 0.02)"
          />
        </g>
      </svg>

      {/* Content overlay positioned absolutely over the SVG */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Tab label and icon */}
        <div className="absolute top-[3px] left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <div className="h-[19px] px-8 flex items-center justify-center gap-1.5">
            {icon && <div className="text-white/25 scale-75">{icon}</div>}
            <span className="text-[9px] text-white/30 font-medium tracking-wide">
              {label}
            </span>
          </div>
        </div>

        {/* Back panel content area (cards peek out from top) */}
        <div
          className="absolute left-[8%] right-[8%] pointer-events-auto"
          style={{
            top: '10%',
            height: '60%',
            padding: '32px 24px 16px',
            overflowY: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MacOSFolder;
