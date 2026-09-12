import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sidebar, type SidebarHandle } from '@/components/Sidebar';
import { ContentArea } from '@/components/ContentArea';

export function HomePage() {
  const [phase, setPhase] = useState<'intro' | 'moving' | 'settled' | 'done'>('intro');
  const [activeSection, setActiveSection] = useState<string>('work');
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<SidebarHandle>(null);

  const introAvatarRef  = useRef<HTMLDivElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);

  const avatarExitRef  = useRef({ x: 0, y: 0, scale: 1 });
  const headingExitRef = useRef({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    // Stage 1: Intro plays centered (0 -> 2100ms)
    // Stage 2: Measure live target coordinates & move elements to Sidebar target positions (at 2100ms)
    const t1 = setTimeout(() => {
      if (introAvatarRef.current && introHeadingRef.current && sidebarRef.current) {
        const sidebarAvatarEl = sidebarRef.current.getAvatarEl();
        const sidebarTitleEl  = sidebarRef.current.getTitleEl();

        if (sidebarAvatarEl) {
          const rIntro  = introAvatarRef.current.getBoundingClientRect();
          const rTarget = sidebarAvatarEl.getBoundingClientRect();

          const fromX = rIntro.left + rIntro.width / 2;
          const fromY = rIntro.top  + rIntro.height / 2;
          const toX   = rTarget.left + rTarget.width / 2;
          const toY   = rTarget.top  + rTarget.height / 2;

          avatarExitRef.current = {
            x: toX - fromX,
            y: toY - fromY,
            scale: rTarget.width / rIntro.width,
          };
        }

        if (sidebarTitleEl) {
          const rIntro  = introHeadingRef.current.getBoundingClientRect();
          const rTarget = sidebarTitleEl.getBoundingClientRect();

          const fromX = rIntro.left + rIntro.width / 2;
          const fromY = rIntro.top  + rIntro.height / 2;
          const toX   = rTarget.left + rTarget.width / 2;
          const toY   = rTarget.top  + rTarget.height / 2;

          headingExitRef.current = {
            x: toX - fromX,
            y: toY - fromY,
            scale: rTarget.height / rIntro.height,
          };
        }
      }

      setPhase('moving');
    }, 2100);

    // Stage 3: Elements arrive and settle! Intro overlay fades out, secondary sidebar & projects fade in (at 2750ms)
    const t2 = setTimeout(() => {
      setPhase('settled');
    }, 2750);

    // Stage 4: Overlay removed from DOM (at 3350ms)
    const t3 = setTimeout(() => {
      setPhase('done');
    }, 3350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Scroll section tracking
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const updateActive = () => {
      const sections = Array.from(content.querySelectorAll('section[id]')) as HTMLElement[];
      if (sections.length === 0) return;
      const triggerY = content.scrollTop + content.clientHeight * 0.3;
      let active = sections[0].id;
      for (const s of sections) {
        if (s.offsetTop <= triggerY) active = s.id;
      }
      setActiveSection(active);
    };
    updateActive();
    content.addEventListener('scroll', updateActive, { passive: true });
    return () => content.removeEventListener('scroll', updateActive);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = contentRef.current?.querySelector(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  const isMovingOrSettled = phase === 'moving' || phase === 'settled';
  const showSecondary     = phase === 'settled' || phase === 'done';
  const isSettled         = phase === 'settled' || phase === 'done';

  return (
    <div className="bg-background text-foreground antialiased">

      {/* ── INTRO OVERLAY ──────────────────────────────────────────────────────
          Solid dark overlay. ONLY fades out AFTER elements move and settle. */}
      {phase !== 'done' && (
        <motion.div
          animate={{ opacity: phase === 'settled' ? 0 : 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-7 pointer-events-none"
        >
          {/* Avatar */}
          <motion.div
            ref={introAvatarRef}
            initial={{ opacity: 0, y: 90, scale: 0.28 }}
            animate={
              isMovingOrSettled
                ? {
                    x: avatarExitRef.current.x,
                    y: avatarExitRef.current.y,
                    scale: avatarExitRef.current.scale,
                    opacity: 1, // Full opacity while moving & settling!
                  }
                : { opacity: [0, 1, 1], y: [90, -80, 0], scale: [0.28, 0.72, 1] }
            }
            transition={
              isMovingOrSettled
                ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                : { duration: 0.88, times: [0, 0.38, 1], ease: ['easeOut', 'easeIn'] }
            }
            className="w-[84px] h-[84px] rounded-full overflow-hidden ring-2 ring-white/25 shadow-[0_8px_50px_rgba(255,255,255,0.10)]"
          >
            <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-cover" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            ref={introHeadingRef}
            initial={{ opacity: 0, letterSpacing: '0.45em', y: 8 }}
            animate={
              isMovingOrSettled
                ? {
                    x: headingExitRef.current.x,
                    y: headingExitRef.current.y,
                    scale: headingExitRef.current.scale,
                    opacity: 1, // Full opacity while moving & settling!
                  }
                : { opacity: 1, letterSpacing: '-0.01em', y: 0 }
            }
            transition={
              isMovingOrSettled
                ? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.02 }
                : {
                    delay: 0.98,
                    duration: 0.65,
                    ease: 'easeOut',
                    opacity: { delay: 0.98, duration: 0.22, ease: 'easeOut' },
                  }
            }
            className="text-3xl lg:text-[2.75rem] font-semibold text-white text-center leading-tight"
          >
            Hey! I'm Abhishek.
          </motion.h1>
        </motion.div>
      )}

      {/* ── MAIN LAYOUT ────────────────────────────────────────────────────────
          Sidebar avatar & title settle in place, then secondary elements & right side projects fade in. */}
      <div
        ref={contentRef}
        className="flex flex-col lg:flex-row h-screen overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <Sidebar
          ref={sidebarRef}
          activeSection={activeSection}
          scrollToSection={scrollToSection}
          showSecondary={showSecondary}
          isSettled={isSettled}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 16 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="flex-1"
        >
          <ContentArea />
        </motion.div>
      </div>

    </div>
  );
}

