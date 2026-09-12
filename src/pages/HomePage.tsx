import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { ContentArea } from '@/components/ContentArea';

export function HomePage() {
  // 'intro'   → ball drops, heading appears
  // 'exiting' → overlay flies toward sidebar position
  // 'done'    → overlay unmounted, layout fully visible
  const [phase, setPhase] = useState<'intro' | 'exiting' | 'done'>('intro');
  const [activeSection, setActiveSection] = useState<string>('work');
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate once where the overlay should fly to on exit.
  // The sidebar avatar lives at roughly (paddingLeft+24, paddingTop+24) = ~(64px, 64px).
  // We move the overlay's centre point from (50vw, 50vh) toward that corner.
  const exitX = -(window.innerWidth  * 0.40);
  const exitY = -(window.innerHeight * 0.40);

  useEffect(() => {
    // 0 ms   → ball arc starts (handled by initial/animate keyframes)
    // 1000ms → heading letter-spacing animation starts (handled by delay)
    // 2200ms → trigger exit: overlay flies to sidebar, layout fades in
    // 2750ms → overlay unmounted
    const t1 = setTimeout(() => setPhase('exiting'), 2200);
    const t2 = setTimeout(() => setPhase('done'), 2750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const updateActive = () => {
      const sections = Array.from(content.querySelectorAll('section[id]')) as HTMLElement[];
      if (sections.length === 0) return;
      const triggerY = content.scrollTop + content.clientHeight * 0.3;
      let active = sections[0].id;
      for (const section of sections) {
        if (section.offsetTop <= triggerY) active = section.id;
      }
      setActiveSection(active);
    };
    updateActive();
    content.addEventListener('scroll', updateActive, { passive: true });
    return () => content.removeEventListener('scroll', updateActive);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const content = contentRef.current;
    const el = content?.querySelector(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="bg-background text-foreground antialiased">

      {/* ─── INTRO OVERLAY ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase !== 'done' && (
          <motion.div
            key="intro-overlay"
            // On exit: fly toward top-left (sidebar position) + shrink + fade
            exit={{
              x: exitX,
              y: exitY,
              scale: 0.3,
              opacity: 0,
              transition: { duration: 0.55, ease: [0.4, 0, 1, 1] },
            }}
            className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center select-none pointer-events-none"
          >
            {/* ── Avatar: ball physics ───────────────────────────────────
                Motion: starts small below centre → arcs UP → falls DOWN.
                y: [start-below, peak-above, resting-centre]
                ease: easeOut on the throw, easeIn on the fall (gravity). */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1],
                y:     [90, -80, 0],
                scale: [0.28, 0.72, 1],
              }}
              transition={{
                duration: 0.88,
                times:    [0, 0.38, 1],
                ease:     ['easeOut', 'easeIn'],
              }}
              className="w-[84px] h-[84px] rounded-full overflow-hidden ring-2 ring-white/25 shadow-[0_8px_50px_rgba(255,255,255,0.10)]"
            >
              <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-cover" />
            </motion.div>

            {/* ── Heading: wide letter-spacing tightens to normal ──────── */}
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.45em', y: 8 }}
              animate={{ opacity: 1, letterSpacing: '-0.01em', y: 0 }}
              transition={{
                // letter-spacing and y animate together after avatar lands
                delay:    0.98,
                duration: 0.65,
                ease:     'easeOut',
                // opacity snaps in quickly
                opacity: { delay: 0.98, duration: 0.2, ease: 'easeOut' },
              }}
              className="mt-7 text-3xl lg:text-[2.75rem] font-semibold text-white tracking-tight text-center leading-tight"
            >
              Hey! I'm Abhishek.
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN LAYOUT ───────────────────────────────────────────────── */}
      {/* Pre-renders while overlay plays so images load.
          Fades in as the overlay flies toward the sidebar. */}
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
