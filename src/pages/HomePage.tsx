import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { ContentArea } from '@/components/ContentArea';

// Target positions inside the sidebar (desktop).
// Sidebar: lg:px-10 lg:py-10 = 40px padding. Avatar: w-12 h-12 = 48px.
const SIDEBAR_AVATAR_CENTER = { x: 40 + 24, y: 40 + 24 };
const SIDEBAR_HEADING_Y     = 40 + 48 + 24 + 12 + 24; // ~148px from top

export function HomePage() {
  const [phase, setPhase] = useState<'intro' | 'exiting' | 'done'>('intro');
  const [activeSection, setActiveSection] = useState<string>('work');
  const contentRef = useRef<HTMLDivElement>(null);

  const introAvatarRef  = useRef<HTMLDivElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);

  // Plain numbers for exit transforms — avoids TS index-signature conflicts with TargetAndTransition
  const avatarExitRef  = useRef({ x: 0, y: 0, scale: 1 });
  const headingExitRef = useRef({ x: 0, y: 0, scale: 1 });
  const [exitReady, setExitReady] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      const isDesktop = window.innerWidth >= 1024;

      if (introAvatarRef.current) {
        const r = introAvatarRef.current.getBoundingClientRect();
        const fromX = r.left + r.width  / 2;
        const fromY = r.top  + r.height / 2;
        avatarExitRef.current = {
          x:     isDesktop ? SIDEBAR_AVATAR_CENTER.x - fromX : 0,
          y:     isDesktop ? SIDEBAR_AVATAR_CENTER.y - fromY : 0,
          scale: isDesktop ? 48 / r.width : 0.5,
        };
      }

      if (introHeadingRef.current) {
        const r = introHeadingRef.current.getBoundingClientRect();
        const fromX = r.left + r.width  / 2;
        const fromY = r.top  + r.height / 2;
        const toX = isDesktop ? 40 + 160 : fromX;
        const toY = isDesktop ? SIDEBAR_HEADING_Y : fromY;
        headingExitRef.current = {
          x:     toX - fromX,
          y:     toY - fromY,
          scale: isDesktop ? 0.52 : 0.6,
        };
      }

      setExitReady(true);
      setPhase('exiting');
    }, 2200);

    const t2 = setTimeout(() => setPhase('done'), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
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

  return (
    <div className="bg-background text-foreground antialiased">

      {/* ── INTRO OVERLAY ──────────────────────────────────────────────────────
          The container holds the background + centers the elements.
          Only the BACKGROUND fades — the elements animate individually. */}
      {phase !== 'done' && (
        <motion.div
          animate={{ opacity: phase === 'exiting' ? 0 : 1 }}
          transition={{ duration: 0.45, delay: phase === 'exiting' ? 0.3 : 0, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-7 pointer-events-none"
        >
          {/* Avatar: ball-physics arc, then flies to sidebar position */}
          <motion.div
            ref={introAvatarRef}
            initial={{ opacity: 0, y: 90, scale: 0.28 }}
            animate={
              exitReady
                ? { x: avatarExitRef.current.x, y: avatarExitRef.current.y,
                    scale: avatarExitRef.current.scale, opacity: 0 }
                : { opacity: [0, 1, 1], y: [90, -80, 0], scale: [0.28, 0.72, 1] }
            }
            transition={
              exitReady
                ? { duration: 0.52, ease: 'easeInOut' }
                : { duration: 0.88, times: [0, 0.38, 1], ease: ['easeOut', 'easeIn'] }
            }
            className="w-[84px] h-[84px] rounded-full overflow-hidden ring-2 ring-white/25 shadow-[0_8px_50px_rgba(255,255,255,0.10)]"
          >
            <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-cover" />
          </motion.div>

          {/* Heading: letter-spacing tightens on entry, then flies to sidebar */}
          <motion.h1
            ref={introHeadingRef}
            initial={{ opacity: 0, letterSpacing: '0.45em', y: 8 }}
            animate={
              exitReady
                ? { x: headingExitRef.current.x, y: headingExitRef.current.y,
                    scale: headingExitRef.current.scale, opacity: 0 }
                : { opacity: 1, letterSpacing: '-0.01em', y: 0 }
            }
            transition={
              exitReady
                ? { duration: 0.52, ease: 'easeInOut', delay: 0.04 }
                : { delay: 0.98, duration: 0.65, ease: 'easeOut',
                    opacity: { delay: 0.98, duration: 0.22, ease: 'easeOut' } }
            }
            className="text-3xl lg:text-[2.75rem] font-semibold text-white text-center leading-tight"
          >
            Hey! I'm Abhishek.
          </motion.h1>
        </motion.div>
      )}

      {/* ── MAIN LAYOUT ────────────────────────────────────────────────────────
          Pre-renders during intro so images load. Fades in as overlay exits. */}
      <motion.div
        ref={contentRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase !== 'intro' ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col lg:flex-row h-screen overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <Sidebar activeSection={activeSection} scrollToSection={scrollToSection} />
        <div className="flex-1">
          <ContentArea />
        </div>
      </motion.div>

    </div>
  );
}
