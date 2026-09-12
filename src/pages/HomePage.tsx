import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { ContentArea } from '@/components/ContentArea';

export function HomePage() {
  const [phase, setPhase] = useState<'intro' | 'reveal'>('intro');
  const [activeSection, setActiveSection] = useState<string>('work');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hold the centered intro for 1.8s, then crossfade into the real layout
    const t = setTimeout(() => setPhase('reveal'), 1800);
    return () => clearTimeout(t);
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
      {/* ── INTRO OVERLAY ──────────────────────────────────────────────────── */}
      {/* Sits on top of everything. Shows avatar + heading centred on a black
          canvas, then fades out letting the real layout beneath reveal itself. */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            key="intro-overlay"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-7 px-6"
          >
            {/* Avatar — drops from above, starts tiny and grows */}
            <motion.div
              initial={{ y: -70, scale: 0.4, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="w-[88px] h-[88px] rounded-full overflow-hidden ring-2 ring-white/25 shadow-[0_8px_60px_rgba(255,255,255,0.10)]"
            >
              <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-cover" />
            </motion.div>

            {/* Heading — rises up after avatar lands */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65, ease: 'easeOut' }}
              className="text-3xl lg:text-5xl font-semibold text-white tracking-tight text-center leading-tight"
            >
              Hey! I'm Abhishek.
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────── */}
      {/* Invisible during the intro (opacity 0) so it pre-loads images.
          Fades in once the overlay exits — overlapping crossfade creates the
          illusion that avatar & heading have "settled" into the sidebar. */}
      <motion.div
        ref={contentRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'reveal' ? 1 : 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
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
