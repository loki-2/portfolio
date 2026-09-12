import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sidebar, type SidebarHandle } from '@/components/Sidebar';
import { ContentArea } from '@/components/ContentArea';

export function HomePage() {
  const [phase, setPhase] = useState<'intro' | 'moving' | 'settled' | 'done'>('intro');
  const [activeSection, setActiveSection] = useState<string>('work');
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<SidebarHandle>(null);

  const introAvatarRef = useRef<HTMLDivElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);

  const avatarExitRef = useRef({ x: 0, y: 0, scale: 1 });
  const headingExitRef = useRef({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    // Stage 1: Center intro sequence (0 -> 3800ms)
    // 0ms -> 440ms: Small ball (scale: 0.25) shoots up to y: -110
    // 440ms -> 850ms: Small ball falls down to y: 0
    // 850ms -> 1240ms: PAUSE sitting at y: 0 as small ball (scale: 0.25)
    // 1240ms -> 1700ms: Small ball smoothly expands to full size (scale: 1.0)
    // 1800ms: Heading emerges AFTER avatar finishes expanding (delay: 1.8s)
    // 2900ms -> 3800ms: Pause so user reads settled text
    const t1 = setTimeout(() => {
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
    }, 3800);

    // Stage 2: Arrive & settle at sidebar target (3800 + 650 = 4450ms)
    const t2 = setTimeout(() => {
      setPhase('settled');
    }, 4450);

    // Stage 3: Clean up overlay DOM (4450 + 600 = 5050ms)
    const t3 = setTimeout(() => {
      setPhase('done');
    }, 5050);

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
  const showSecondary = phase === 'settled' || phase === 'done';
  const isSettled = phase === 'settled' || phase === 'done';

  return (
    <div className="bg-background text-foreground antialiased">

      {/* ── INTRO OVERLAY ────────────────────────────────────────────────────── */}
      {phase !== 'done' && (
        <motion.div
          animate={{ opacity: phase === 'settled' ? 0 : 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-7 pointer-events-none"
        >
          {/* Avatar: small ball shoots up -> falls small -> pauses sitting down -> expands smoothly */}
          <motion.div
            ref={introAvatarRef}
            initial={{ opacity: 0, y: 140, scale: 0.25 }}
            animate={
              isMovingOrSettled
                ? {
                  x: avatarExitRef.current.x,
                  y: avatarExitRef.current.y,
                  scale: avatarExitRef.current.scale,
                  opacity: 1,
                }
                : {
                  opacity: [0, 1, 1, 1, 1],
                  y: [140, -110, 0, 0, 0],
                  scale: [0.25, 0.25, 0.25, 0.25, 1],
                }
            }
            transition={
              isMovingOrSettled
                ? { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                : {
                  duration: 1.7,
                  times: [0, 0.26, 0.50, 0.73, 1],
                  ease: ['easeOut', 'easeIn', 'easeOut', [0.34, 1.3, 0.64, 1]] as any,
                }
            }
            className="w-[84px] h-[84px] rounded-full overflow-hidden ring-2 ring-white/25 shadow-[0_8px_50px_rgba(255,255,255,0.10)]"
          >
            <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-cover" />
          </motion.div>

          {/* Heading: subtle letter spacing -> holds -> elastic spring squeeze -> rebounds into position */}
          <motion.h1
            ref={introHeadingRef}
            initial={{ opacity: 0, letterSpacing: '0.14em', y: 12 }}
            animate={
              isMovingOrSettled
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
                  letterSpacing: ['0.14em', '0.14em', '-0.035em', '-0.025em'],
                  scale: [1, 1, 1.02, 1],
                }
            }
            transition={
              isMovingOrSettled
                ? { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                : {
                  delay: 1.8,
                  duration: 1.15,
                  times: [0, 0.35, 0.82, 1],
                  ease: ['easeOut', [0.34, 1.56, 0.64, 1], 'easeOut'] as any,
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

