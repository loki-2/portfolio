import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sidebar, type SidebarHandle } from '@/components/Sidebar';
import { ContentArea } from '@/components/ContentArea';
import { useSmoothScroll } from '@/lib/useSmoothScroll';

export function HomePage() {
  const hasSeenIntroRef = useRef<boolean>(
    typeof window !== 'undefined' &&
    sessionStorage.getItem('hasSeenIntro') === 'true' &&
    !new URLSearchParams(window.location.search).has('intro')
  );
  const hasSeenIntro = hasSeenIntroRef.current;

  const [phase, setPhase] = useState<'intro' | 'moving' | 'settled' | 'done'>(
    hasSeenIntro ? 'done' : 'intro'
  );
  const [activeSection, setActiveSection] = useState<string>('work');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<SidebarHandle>(null);

  const { scrollTo } = useSmoothScroll({ wrapperRef: contentRef });

  const introAvatarRef = useRef<HTMLDivElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);

  const avatarExitRef = useRef({ x: 0, y: 0, scale: 1 });
  const headingExitRef = useRef({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    if (hasSeenIntro) return;

    // Stage 1: Center intro sequence (0 -> 3200ms)
    const tMove = setTimeout(() => {
      if (introAvatarRef.current && introHeadingRef.current && sidebarRef.current) {
        const sidebarAvatarEl = sidebarRef.current.getAvatarEl();
        const sidebarTitleEl = sidebarRef.current.getTitleEl();

        if (sidebarAvatarEl) {
          const rIntro = introAvatarRef.current.getBoundingClientRect();
          const rTarget = sidebarAvatarEl.getBoundingClientRect();

          const fromX = rIntro.left + rIntro.width / 2;
          const fromY = rIntro.top + rIntro.height / 2;
          const toX = rTarget.left + rTarget.width / 2;
          const toY = rTarget.top + rTarget.height / 2;

          avatarExitRef.current = {
            x: toX - fromX,
            y: toY - fromY,
            scale: rTarget.width / rIntro.width,
          };
        }

        if (sidebarTitleEl) {
          const rIntro = introHeadingRef.current.getBoundingClientRect();
          const rTarget = sidebarTitleEl.getBoundingClientRect();

          const fromX = rIntro.left + rIntro.width / 2;
          const fromY = rIntro.top + rIntro.height / 2;
          const toX = rTarget.left + rTarget.width / 2;
          const toY = rTarget.top + rTarget.height / 2;

          headingExitRef.current = {
            x: toX - fromX,
            y: toY - fromY,
            scale: rTarget.width / rIntro.width,
          };
        }
      }

      setPhase('moving');
    }, 3200);

    // Stage 2: Arrive & settle at sidebar target (3200 + 650 = 3850ms)
    const tSettle = setTimeout(() => {
      setPhase('settled');
    }, 3850);

    // Stage 3: Clean up overlay DOM (3850 + 1350 = 5200ms)
    const tDone = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('hasSeenIntro', 'true');
    }, 5200);

    return () => {
      clearTimeout(tMove);
      clearTimeout(tSettle);
      clearTimeout(tDone);
      sessionStorage.setItem('hasSeenIntro', 'true');
    };
  }, [hasSeenIntro]);

  const isManualScrollingRef = useRef(false);
  const manualScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll section tracking & sticky mobile header scroll detection
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const updateActive = () => {
      setIsScrolled(content.scrollTop > 20);

      if (isManualScrollingRef.current) return;

      const sections = Array.from(content.querySelectorAll('section[id]')) as HTMLElement[];
      if (sections.length === 0) return;

      // Header height threshold: section is active once it reaches near top nav (~110px)
      const headerThreshold = 110;
      let active = sections[0].id;

      for (const s of sections) {
        const rect = s.getBoundingClientRect();
        if (rect.top <= headerThreshold) {
          active = s.id;
        }
      }

      if (active === 'ai') active = 'about';
      setActiveSection(active);
    };
    updateActive();
    content.addEventListener('scroll', updateActive, { passive: true });
    return () => content.removeEventListener('scroll', updateActive);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const targetId = sectionId === 'home' ? 'work' : sectionId;
    setActiveSection(targetId);

    // Suppress scroll-listener overrides while Lenis is animating the scroll
    if (manualScrollTimerRef.current) clearTimeout(manualScrollTimerRef.current);
    isManualScrollingRef.current = true;
    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 1000);

    if (sectionId === 'work' || sectionId === 'home') {
      scrollTo(0);
      return;
    }
    const el = contentRef.current?.querySelector(`#${sectionId}`);
    if (el) {
      scrollTo(el as HTMLElement);
    }
  };

  const showSecondary = phase === 'settled' || phase === 'done';
  const isSettled = phase === 'settled' || phase === 'done';

  return (
    <div className="bg-transparent text-foreground antialiased">

      {/* ── INTRO OVERLAY ────────────────────────────────────────────────────── */}
      {phase !== 'done' && (
        <motion.div
          animate={{ opacity: phase === 'settled' ? 0 : 1 }}
          transition={{ duration: 0.05, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-transparent flex flex-col items-center justify-center gap-7 pointer-events-none"
        >
          {/* Avatar: small ball shoots up -> falls -> 2nd bounce -> expands smoothly -> moves to sidebar */}
          <motion.div
            ref={introAvatarRef}
            initial={{ opacity: 0, y: 140, scale: 0.25 }}
            animate={
              phase === 'moving' || phase === 'settled'
                ? {
                  x: avatarExitRef.current.x,
                  y: avatarExitRef.current.y,
                  scale: avatarExitRef.current.scale,
                  opacity: 1,
                }
                : {
                  opacity: [0, 1, 1, 1, 1, 1],
                  y: [140, -110, 0, -26, 0, 0],
                  scale: [0.25, 0.25, 0.25, 0.25, 0.25, 1],
                }
            }
            transition={
              phase === 'moving' || phase === 'settled'
                ? { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                : {
                  duration: 2,
                  times: [0, 0.24, 0.44, 0.58, 0.8, 1],
                  ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn', [0.34, 1.3, 0.64, 1]] as any,
                }
            }
            className="w-[64px] h-[64px] rounded-full overflow-hidden shadow-[0_8px_50px_rgba(255,255,255,0.10)] border-[2px] border-white/6 ring-2 ring-white/6 bg-white/8"
          >
            <img src="/avatar1.png" alt="Abhishek" className="w-full h-full object-cover object-top scale-105" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            ref={introHeadingRef}
            initial={{ opacity: 0, letterSpacing: '0.09em', y: 12 }}
            animate={
              phase === 'moving' || phase === 'settled'
                ? {
                  x: headingExitRef.current.x,
                  y: headingExitRef.current.y,
                  scale: headingExitRef.current.scale,
                  letterSpacing: '-0.025em',
                  opacity: 1,
                }
                : {
                  opacity: [0, 1, 1, 1],
                  y: [12, 0, 0, 0],
                  letterSpacing: ['0.09em', '0.09em', '-0.04em', '-0.025em'],
                  scale: [1, 1, 1.02, 1],
                }
            }
            transition={
              phase === 'moving' || phase === 'settled'
                ? { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                : {
                  delay: 2.0,
                  duration: 2.0,
                  times: [0, 0.20, 0.80, 1],
                  ease: ['easeOut', [0.05, 0.9, 0.1, 1], 'easeOut'] as any,
                }
            }
            className="text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-[1.15] text-center inline-block"
          >
            Hey! I'm Abhishek.
          </motion.h1>
        </motion.div>
      )}

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="h-[100dvh] lg:h-screen overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <div className="flex flex-col lg:flex-row min-h-full w-full">
          <Sidebar
            ref={sidebarRef}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            showSecondary={showSecondary}
            isSettled={isSettled}
            phase={phase}
            isScrolled={isScrolled}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 16 }}
            transition={hasSeenIntro
              ? { duration: 0 }
              : { duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="flex-1 min-w-0"
          >
            <ContentArea />
          </motion.div>
        </div>
      </div>

    </div>
  );
}
