import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';

interface UseSmoothScrollOptions {
  wrapperRef?: React.RefObject<HTMLElement | null>;
  duration?: number;
}

export function useSmoothScroll({ wrapperRef, duration = 1.2 }: UseSmoothScrollOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    const wrapperEl = wrapperRef?.current;

    // Use wrapper element if provided and appropriate for current viewport
    const targetWrapper = wrapperEl && (isDesktop || wrapperEl.classList.contains('h-screen') || wrapperEl.classList.contains('h-[100dvh]'))
      ? wrapperEl
      : window;

    const targetContent = targetWrapper instanceof HTMLElement
      ? (targetWrapper.firstElementChild as HTMLElement) || targetWrapper
      : document.documentElement;

    const lenis = new Lenis({
      wrapper: targetWrapper,
      content: targetContent,
      duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false, // preserve fast, native responsive touch momentum on mobile
      autoRaf: true,
      autoResize: true,
    });

    lenisRef.current = lenis;

    // Continuously monitor content dimensions so Lenis never clamps scroll prematurely
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });

    if (targetContent instanceof HTMLElement) {
      resizeObserver.observe(targetContent);
    }
    if (targetWrapper instanceof HTMLElement && targetWrapper !== targetContent) {
      resizeObserver.observe(targetWrapper);
    }

    const handleResize = () => lenis.resize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('load', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', handleResize);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [wrapperRef, duration]);

  const scrollTo = useCallback((target: string | HTMLElement | number, options?: { offset?: number; duration?: number }) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        duration: options?.duration ?? 1.2,
        offset: options?.offset ?? 0,
      });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return { lenisRef, scrollTo };
}
