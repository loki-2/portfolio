import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
}

interface StarfieldProps {
  starCount?: number;
  className?: string;
  minStarSize?: number;
  maxStarSize?: number;
  opacity?: number;
}

export const Starfield: React.FC<StarfieldProps> = ({
  starCount = 140,
  className = '',
  minStarSize = 0.5,
  maxStarSize = 1.8,
  opacity = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];

    // Helper to generate stars relative to canvas dimensions
    const initStars = (width: number, height: number) => {
      const starColors = [
        '255, 255, 255',      // Pure white
        '220, 235, 255',      // Icy blue-white
        '255, 245, 230',      // Soft warm white
        '200, 225, 255',      // Subtle sky blue
      ];

      stars = Array.from({ length: starCount }, () => {
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: minStarSize + Math.random() * (maxStarSize - minStarSize),
          baseAlpha: 0.2 + Math.random() * 0.65,
          twinkleSpeed: 0.0008 + Math.random() * 0.0025,
          phase: Math.random() * Math.PI * 2,
          color,
        };
      });
    };

    // Resize canvas to match parent display size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth || window.innerWidth;
      const height = parent.clientHeight || window.innerHeight;

      // Handle retina displays
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initStars(width, height);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Animation render loop
    const render = (time: number) => {
      const width = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const height = canvas.height / Math.min(window.devicePixelRatio || 1, 2);

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Sinusoidal twinkle calculation for natural blinking sky effect
        const twinkle = Math.sin(time * star.twinkleSpeed + star.phase);
        const alpha = Math.max(0.05, Math.min(1, star.baseAlpha + twinkle * 0.35));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${alpha})`;
        ctx.fill();

        // Add soft ambient glow to larger, brighter stars
        if (star.size > 1.3 && alpha > 0.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.color}, ${alpha * 0.18})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [starCount, minStarSize, maxStarSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{ opacity }}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      aria-hidden="true"
    />
  );
};
