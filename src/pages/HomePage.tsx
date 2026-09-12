import { useState, useEffect, useRef } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { ContentArea } from '@/components/ContentArea';

export function HomePage() {
  const [introPhase, setIntroPhase] = useState<'center' | 'morphing' | 'done'>('center');
  const [activeSection, setActiveSection] = useState<string>('work');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stage 1 (0ms - 1300ms): Avatar scales gracefully in center, heading rises smoothly.
    // Stage 2 (1300ms): Switch to 'morphing' -> Framer Motion FLIP morphs avatar & heading to sidebar!
    // Stage 3 (2200ms): Switch to 'done' -> intro completed.
    const t1 = setTimeout(() => {
      setIntroPhase('morphing');
    }, 1300);

    const t2 = setTimeout(() => {
      setIntroPhase('done');
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
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
        if (section.offsetTop <= triggerY) {
          active = section.id;
        }
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
    <LayoutGroup id="cinematic-intro">
      <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-white/20">

        {/* CENTER HERO STAGE (0ms to 1300ms) */}
        <AnimatePresence>
          {introPhase === 'center' && (
            <motion.div
              key="centered-hero"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none px-6"
            >
              <div className="flex flex-col items-center text-center gap-6">
                {/* Centered Avatar */}
                <motion.div
                  layoutId="avatar-morph"
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  initial={{ opacity: 0, scale: 0.6, y: -30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-white/10 ring-2 ring-white/30 shadow-[0_0_50px_rgba(255,255,255,0.12)] shrink-0"
                >
                  <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-cover" />
                </motion.div>

                {/* Centered Heading */}
                <motion.div
                  layoutId="heading-morph"
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1"
                >
                  <h1 className="text-3xl lg:text-5xl font-semibold leading-[1.15] tracking-tight text-white">
                    Hey! I'm Abhishek.<br className="hidden lg:block" />
                    <span className="text-white/48 font-medium lg:ml-0 ml-2">
                      Product Designer &amp; Builder.
                    </span>
                  </h1>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN PAGE LAYOUT */}
        <div
          ref={contentRef}
          className="flex flex-col lg:flex-row h-screen overflow-y-auto overflow-x-hidden bg-background text-foreground antialiased scroll-smooth"
        >
          <Sidebar
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            introPhase={introPhase}
          />
          <div className="flex-1">
            <ContentArea introPhase={introPhase} />
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}

