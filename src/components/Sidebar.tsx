import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LetsTalkButton } from './LetsTalkButton';

export interface SidebarHandle {
  getAvatarEl: () => HTMLDivElement | null;
  getTitleEl: () => HTMLSpanElement | null;
}

interface SidebarProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
  showSecondary?: boolean;
  isSettled?: boolean;
  phase?: 'intro' | 'moving' | 'settled' | 'done';
}

const navItems = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
];

export const Sidebar = forwardRef<SidebarHandle, SidebarProps>(
  ({ activeSection, scrollToSection, showSecondary = true, isSettled = true, phase = 'done' }, ref) => {
    const desktopAvatarRef = useRef<HTMLDivElement>(null);
    const mobileAvatarRef = useRef<HTMLDivElement>(null);
    const titleTextRef = useRef<HTMLSpanElement>(null);
    const [isAvatarHovered, setIsAvatarHovered] = useState(false);
    // If phase is 'done', intro was skipped or already finished
    const [hasSettledIntro, setHasSettledIntro] = useState(phase === 'done');

    useEffect(() => {
      if (phase === 'settled' && !hasSettledIntro) {
        // avatar1 has landed at the sidebar! Pause so user clearly sees it, then gently roll to avatar.png
        const timer = setTimeout(() => {
          setHasSettledIntro(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [phase, hasSettledIntro]);

    // Active waving avatar during intro (before roll settles) OR when user hovers
    const showWavingAvatar = isAvatarHovered || !hasSettledIntro;

    useImperativeHandle(ref, () => ({
      getAvatarEl: () => {
        if (desktopAvatarRef.current && desktopAvatarRef.current.offsetWidth > 0) {
          return desktopAvatarRef.current;
        }
        return mobileAvatarRef.current;
      },
      getTitleEl: () => titleTextRef.current,
    }));

    return (
      <aside className="w-full lg:w-[400px] shrink-0 flex flex-col lg:justify-between lg:h-screen lg:sticky top-0 pt-6 lg:pt-10 pb-0 lg:pb-0 px-4 sm:px-6 lg:px-10 gap-0 border-b lg:border-b-0 border-white/[0.08] bg-transparent z-10 overflow-hidden">

        {/* TOP SECTION */}
        <div className="flex flex-col gap-0">

          {/* Mobile: Avatar + Nav row */}
          <div className="mb-6 sm:mb-7 flex justify-between items-center lg:hidden">
            <div
              ref={mobileAvatarRef}
              className="w-10 h-10 border border-white/10 rounded-full overflow-hidden bg-white/10 shrink-0"
              style={{
                opacity: isSettled ? 1 : 0,
                filter: isSettled ? 'blur(0px)' : 'blur(12px)',
                transition: 'opacity 400ms ease-out, filter 600ms ease-out',
              }}
            >
              <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-contain p-1" />
            </div>

            <motion.nav
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 10 }}
              transition={showSecondary
                ? { duration: 0 }
                : { duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="flex items-center gap-2.5 sm:gap-4 bg-white/5 border border-white/10 rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2.5"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-xs sm:text-sm font-medium transition-colors ${activeSection === item.id ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                >
                  {item.label}
                </button>
              ))}
            </motion.nav>
          </div>

          {/* Desktop: Avatar with vertical roll transition (no blur filter) */}
          <div
            ref={desktopAvatarRef}
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
            className="mb-6 hidden border-[2px] border-white/6 lg:block w-14 h-14 rounded-full overflow-hidden bg-white/8 shrink-0 relative cursor-pointer select-none"
            style={{
              opacity: isSettled ? 1 : 0,
            }}
          >
            {/* Resting avatar (avatar.png): reduced size via p-2, rolls down from top to settle, goes to top on hover */}
            <motion.img
              src="/avatar.png"
              alt="Abhishek"
              initial={phase === 'done' ? { y: 0, opacity: 1 } : { y: -52, opacity: 0 }}
              animate={{
                y: showWavingAvatar ? -52 : 0,
                opacity: showWavingAvatar ? 0 : 1,
              }}
              transition={{
                duration: phase === 'settled' ? 0.65 : 0.42,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute inset-0 w-full h-full object-contain p-2 pointer-events-none"
            />

            {/* Waving avatar (avatar1.png): displayed upon landing, rolls down away to settle, comes from bottom on hover */}
            <motion.img
              src="/avatar1.png"
              alt="Abhishek waving"
              initial={phase === 'done' ? { y: 52, opacity: 0 } : { y: 0, opacity: 1 }}
              animate={{
                y: showWavingAvatar ? 0 : 52,
                opacity: showWavingAvatar ? 1 : 0,
              }}
              transition={{
                duration: phase === 'settled' ? 0.65 : 0.42,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute inset-0 w-full h-full object-cover object-top scale-105 pointer-events-none"
            />
          </div>

          {/* Heading */}
          <div className="mt-0">
            <h1 className="text-[28px] sm:text-[32px] lg:text-4xl font-semibold leading-[1.18] sm:leading-[1.15] tracking-tight text-white">
              <span
                ref={titleTextRef}
                className="inline-block transition-opacity duration-300"
                style={{ opacity: isSettled ? 1 : 0 }}
              >
                Hey! I'm Abhishek.
              </span>
              <br className="hidden lg:block" />
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 12 }}
                transition={showSecondary
                  ? { duration: 0 }
                  : { duration: 0.5, ease: 'easeOut', delay: 0.08 }}
                className="text-white/60 font-medium block mt-1 sm:mt-1.5"
              >
                Product Designer &amp; Builder.
              </motion.span>
            </h1>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 12 }}
            transition={showSecondary
              ? { duration: 0 }
              : { duration: 0.5, ease: 'easeOut', delay: 0.14 }}
            className="text-[15px] sm:text-base font-normal text-white/60 leading-[1.6] max-w-sm mt-3.5 sm:mt-4"
          >
            3+ years of experience in designing products at fast-paced, high-ownership startups—from MVP to Growth.
          </motion.p>

          {/* CTA + Mobile Image Row (Image rests right on the bottom border line) */}
          <div className="flex items-end justify-between pt-0 relative overflow-visible mt-6 sm:mt-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 12 }}
              transition={showSecondary
                ? { duration: 0 }
                : { duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              className="flex flex-col gap-2.5 shrink-0 z-10 pb-4 sm:pb-5"
            >
              <LetsTalkButton />

              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-emerald-400/90">Open for work</span>
              </div>
            </motion.div>

            {/* Mobile-only: meworking.png resting right on the bottom line */}
            <div className="lg:hidden overflow-hidden pointer-events-none select-none -mr-4 sm:-mr-6 shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 50 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: showSecondary ? 0.15 : 0 }}
                className="flex items-end justify-end"
              >
                <img
                  src="/meworking.png"
                  alt="Abhishek working"
                  className="w-[155px] sm:w-[185px] h-auto object-contain object-right-bottom -mb-[2px] pointer-events-none block"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* BOTTOM — Desktop Footer Image (No left/bottom padding inset, flush to bottom left) */}
        <div className="hidden lg:block mt-auto overflow-hidden pointer-events-none select-none -ml-10 -mr-10">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 80 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: showSecondary ? 0.15 : 0 }}
            className="flex items-end justify-start"
          >
            <img
              src="/meworking.png"
              alt="Abhishek working"
              className="w-60 lg:w-64 h-auto object-contain object-left-bottom -mb-8 lg:-mb-10 pointer-events-none block"
            />
          </motion.div>
        </div>
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

