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
    // Stage 1: Center intro sequence (0 -> 2800ms)
    // 0ms -> 1200ms: Ball arc (thrown up to y: -110, drops & lands on text at 840ms with squash impact, bounces)
    // 820ms -> 1260ms: Text emerges under landing ball with wide letter spacing (0.45em), holds wide
    // 1260ms -> 1920ms: Letter-spacing tightens from 0.45em to -0.025em
    // 1920ms -> 2800ms: Pause at center screen so user reads settled text
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
    }, 2800);

    // Stage 2: Arrive & settle at sidebar target (2800 + 650 = 3450ms)
    const t2 = setTimeout(() => {
      setPhase('settled');
    }, 3450);

    // Stage 3: Clean up overlay DOM (3450 + 600 = 4050ms)
    const t3 = setTimeout(() => {
      setPhase('done');
    }, 4050);

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
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-7 pointer-events-none"
        >
          {/* Avatar: physics ball (small ball going up -> grows coming down -> impacts text -> bounce -> settle) */}
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
                  y: [140, -110, 0, -14, 0],
                  scale: [0.25, 0.25, 1.08, 0.96, 1],
                }
            }
            transition={
              isMovingOrSettled
                ? { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                : {
                  duration: 1.2,
                  times: [0, 0.38, 0.7, 0.88, 1],
                  ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn'],
                }
            }
            className="w-[84px] h-[84px] rounded-full overflow-hidden ring-2 ring-white/25 shadow-[0_8px_50px_rgba(255,255,255,0.10)]"
          >
            <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-cover" />
          </motion.div>

          {/* Heading: kinetic character ripple upon ball impact with elastic spring overshoot */}
          <motion.h1
            ref={introHeadingRef}
            animate={
              isMovingOrSettled
                ? {
                  x: headingExitRef.current.x,
                  y: headingExitRef.current.y,
                  scale: headingExitRef.current.scale,
                  opacity: 1,
                }
                : { opacity: 1, y: 0 }
            }
            transition={
              isMovingOrSettled
                ? { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                : { duration: 0.4 }
            }
            className="text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-[1.15] text-center inline-block"
          >
            {Array.from("Hey! I'm Abhishek.").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={
                  isMovingOrSettled
                    ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }
                    : {
                      opacity: [0, 1, 1],
                      y: [16, -3, 0],
                      filter: ['blur(4px)', 'blur(0px)', 'blur(0px)'],
                      scale: [1.2, 0.96, 1],
                    }
                }
                transition={
                  isMovingOrSettled
                    ? { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                    : {
                      delay: 0.82 + index * 0.022,
                      duration: 0.5,
                      ease: [0.34, 1.56, 0.64, 1],
                    }
                }
                className="inline-block whitespace-pre"
              >
                {char}
              </motion.span>
            ))}
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

