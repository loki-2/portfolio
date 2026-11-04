/**
 * Alternative Implementation Approaches for macOS Folder
 *
 * This file demonstrates different technical approaches that were considered
 * for implementing the macOS folder shape, showing the tradeoffs of each.
 */

import React from 'react';

/**
 * APPROACH 1: CSS clip-path
 *
 * Pros:
 * - Simple to implement
 * - Good browser support
 * - Easy to animate
 *
 * Cons:
 * - Limited curve control (can't create perfect bezier curves)
 * - Can't have different fills for different sections
 * - Difficult to add inner shadows and highlights
 * - Less precise than SVG
 */
export const FolderWithClipPath: React.FC = () => {
  return (
    <div className="relative w-full max-w-md">
      {/* Tab */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 z-40"
        style={{
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
        }}
      >
        <div className="h-7 px-10 bg-gradient-to-b from-[#33333a] to-[#2d2d34] rounded-full shadow-xl" />
      </div>

      {/* Back panel - using border-radius */}
      <div
        className="mt-8 bg-gradient-to-b from-[#1c1c22]/50 to-[#18181e]/50 backdrop-blur-sm"
        style={{
          height: '360px',
          borderRadius: '28px 28px 0 0',
        }}
      />

      {/* Front panel - using CSS only */}
      <div
        className="bg-gradient-to-b from-[#2f2f36] via-[#2a2a30] to-[#26262c]"
        style={{
          height: '240px',
          borderRadius: '20px 20px 36px 36px',
          marginTop: '-60px',
        }}
      />
    </div>
  );
};

/**
 * APPROACH 2: Multiple div elements with border-radius
 *
 * Pros:
 * - No SVG knowledge needed
 * - Easy to understand
 * - Works with Tailwind utilities
 *
 * Cons:
 * - Can't create true macOS continuous curves (only circular corners)
 * - Harder to create seamless transitions between panels
 * - Limited gradient control
 * - No true bezier curve support
 */
export const FolderWithDivs: React.FC = () => {
  return (
    <div className="relative w-full max-w-md select-none">
      {/* Tab */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-40">
        <div className="h-7 px-10 bg-gradient-to-b from-[#33333a] to-[#2d2d34] rounded-full shadow-xl" />
      </div>

      {/* Container */}
      <div className="relative">
        {/* Back panel */}
        <div
          className="bg-gradient-to-b from-[#1c1c22]/50 to-[#18181e]/50 backdrop-blur-sm px-6 pt-10 pb-6"
          style={{
            height: '360px',
            borderRadius: '28px 28px 0 0',
          }}
        >
          {/* Content goes here */}
        </div>

        {/* Front panel */}
        <div
          className="relative bg-gradient-to-b from-[#2f2f36] via-[#2a2a30] to-[#26262c]"
          style={{
            height: '240px',
            borderRadius: '20px 20px 36px 36px',
            marginTop: '-60px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}
        >
          {/* Top edge highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * APPROACH 3: Canvas API
 *
 * Pros:
 * - Pixel-perfect control
 * - Can create any shape
 * - Good for dynamic/animated shapes
 *
 * Cons:
 * - Not scalable (raster-based)
 * - Accessibility issues (not semantic HTML)
 * - Harder to maintain
 * - Poor for responsive design
 * - Can't easily add CSS effects like backdrop-filter
 */
export const FolderWithCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 550;

    // Draw folder tab
    ctx.fillStyle = '#33333a';
    ctx.beginPath();
    ctx.roundRect(150, 5, 100, 20, 10);
    ctx.fill();

    // Draw back panel
    ctx.fillStyle = 'rgba(28, 28, 34, 0.5)';
    ctx.beginPath();
    ctx.roundRect(30, 50, 340, 290, [27, 27, 0, 0]);
    ctx.fill();

    // Draw front panel
    const gradient = ctx.createLinearGradient(0, 300, 0, 545);
    gradient.addColorStop(0, '#2f2f36');
    gradient.addColorStop(0.5, '#2a2a30');
    gradient.addColorStop(1, '#26262c');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(20, 310, 360, 235, [10, 10, 25, 25]);
    ctx.fill();
  }, []);

  return <canvas ref={canvasRef} className="w-full h-auto" />;
};

/**
 * APPROACH 4: CSS with transform 3D perspective
 *
 * Pros:
 * - Creates real 3D depth
 * - Smooth GPU-accelerated animations
 * - Native browser support
 *
 * Cons:
 * - Complex CSS transforms
 * - Perspective distortion may not match macOS flat design
 * - Harder to control exact curves
 * - Can look "off" if not tuned perfectly
 */
export const FolderWith3D: React.FC = () => {
  return (
    <div className="relative w-full max-w-md" style={{ perspective: '1000px' }}>
      {/* Tab */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-40">
        <div className="h-7 px-10 bg-gradient-to-b from-[#33333a] to-[#2d2d34] rounded-full shadow-xl" />
      </div>

      {/* Container with 3D transform */}
      <div
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Back panel - pushed back in 3D space */}
        <div
          className="bg-gradient-to-b from-[#1c1c22]/50 to-[#18181e]/50 backdrop-blur-sm px-6 pt-10 pb-6"
          style={{
            height: '360px',
            borderRadius: '28px 28px 0 0',
            transform: 'translateZ(-20px)',
          }}
        />

        {/* Front panel - at normal Z position */}
        <div
          className="bg-gradient-to-b from-[#2f2f36] via-[#2a2a30] to-[#26262c]"
          style={{
            height: '240px',
            borderRadius: '20px 20px 36px 36px',
            marginTop: '-60px',
            transform: 'translateZ(0px)',
          }}
        />
      </div>
    </div>
  );
};

/**
 * APPROACH 5: SVG with Path (CHOSEN APPROACH)
 *
 * Pros:
 * - Pixel-perfect bezier curves matching macOS design
 * - Scalable vector graphics (resolution independent)
 * - Precise gradient control with multiple stops
 * - Can layer multiple paths with different fills
 * - Supports filters (blur, drop-shadow)
 * - Semantic and accessible
 * - Easy to animate with CSS or JS
 * - Great browser support
 *
 * Cons:
 * - Requires SVG knowledge
 * - Path syntax can be verbose
 * - Slightly more complex than pure CSS
 *
 * Why it's the best choice:
 * - macOS uses bezier curves that can only be precisely replicated with SVG paths
 * - The continuous rounded rectangle shape requires specific control points
 * - Layered gradients and filters are easier to manage in SVG
 * - Scales perfectly on any screen size/resolution
 */
export const FolderWithSVGPath: React.FC = () => {
  return (
    <svg
      className="w-full h-auto"
      viewBox="0 0 400 550"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients defined once, used multiple times */}
        <linearGradient id="demo-tab" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#33333a" />
          <stop offset="100%" stopColor="#2d2d34" />
        </linearGradient>
        <linearGradient id="demo-back" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(28, 28, 34, 0.5)" />
          <stop offset="100%" stopColor="rgba(24, 24, 30, 0.5)" />
        </linearGradient>
        <linearGradient id="demo-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2f2f36" />
          <stop offset="50%" stopColor="#2a2a30" />
          <stop offset="100%" stopColor="#26262c" />
        </linearGradient>
      </defs>

      {/* Tab - precise bezier curves for smooth rounded pill */}
      <path
        d="M 150 5 C 150 2.238 152.238 0 155 0 L 245 0 C 247.762 0 250 2.238 250 5 L 250 20 C 250 22.762 247.762 25 245 25 L 155 25 C 152.238 25 150 22.762 150 20 Z"
        fill="url(#demo-tab)"
      />

      {/* Back panel - large radius corners at top */}
      <path
        d="M 30 50 C 30 35.088 42.088 23 57 23 L 343 23 C 357.912 23 370 35.088 370 50 L 370 340 L 30 340 Z"
        fill="url(#demo-back)"
      />

      {/* Front panel - pronounced bottom rounding */}
      <path
        d="M 20 310 C 20 304.477 24.477 300 30 300 L 370 300 C 375.523 300 380 304.477 380 310 L 380 510 C 380 529.33 364.33 545 345 545 L 55 545 C 35.67 545 20 529.33 20 510 Z"
        fill="url(#demo-front)"
      />
    </svg>
  );
};

/**
 * COMPARISON MATRIX
 *
 * Approach          | Complexity | Precision | Scalability | Performance | Maintenance
 * ------------------|------------|-----------|-------------|-------------|------------
 * clip-path         | Low        | Medium    | Good        | Great       | Easy
 * Multiple divs     | Very Low   | Low       | Good        | Great       | Very Easy
 * Canvas API        | High       | High      | Poor        | Good        | Hard
 * 3D Transform      | Medium     | Medium    | Good        | Great       | Medium
 * SVG Path          | Medium     | Very High | Excellent   | Great       | Medium
 *
 * WINNER: SVG Path - Best balance of precision, scalability, and maintainability
 */
