import React, { useEffect, useState } from 'react';

/**
 * ─── CURSOR MODE SWITCH (IN CODE) ─────────────────────────────────────────────
 * Set `USE_CUSTOM_CURSOR` to:
 *   - `true`  : Active custom spaceship cursor with hover interactions
 *   - `false` : Standard native browser cursor
 */
export const USE_CUSTOM_CURSOR = false;

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  useEffect(() => {
    if (!USE_CUSTOM_CURSOR) {
      document.documentElement.classList.remove('custom-cursor-mode');
      return;
    }

    document.documentElement.classList.add('custom-cursor-mode');

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      // Check if target or parent is interactive
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a, button, input, textarea, select, [role="button"], .cursor-pointer')
        );
        setIsHovered(isInteractive);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.documentElement.classList.remove('custom-cursor-mode');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!USE_CUSTOM_CURSOR) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[99999] transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x - 8}px, ${pos.y - 8}px, 0px)`,
      }}
    >
      {/* Custom Spaceship Image */}
      <img
        src="/custom-cursor.png"
        alt="Custom Cursor"
        className={`w-10 h-10 object-contain transition-transform duration-150 ${
          isMouseDown
            ? 'scale-90 rotate-[-4deg]'
            : isHovered
            ? 'scale-125 rotate-[-2deg]'
            : 'scale-100'
        }`}
      />
    </div>
  );
};
