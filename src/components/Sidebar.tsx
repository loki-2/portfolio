import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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
  isScrolled?: boolean;
}

interface NavItemConfig {
  id: string;
  label: string;
  icon: React.FC<{ active: boolean }>;
}

function HomeNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="block shrink-0">
      <path
        d="M10.8 2.9a2 2 0 0 1 2.4 0l7.2 5.6a2 2 0 0 1 .8 1.6V19a2 2 0 0 1-2 2H4.8a2 2 0 0 1-2-2v-8.9a2 2 0 0 1 .8-1.6l7.2-5.6Z"
        fill={active ? '#FFFFFF' : 'none'}
        stroke={active ? '#FFFFFF' : 'currentColor'}
        strokeWidth={active ? '0' : '2.2'}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FolderNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="block shrink-0">
      <path
        d="M3 7.8A2.8 2.8 0 0 1 5.8 5h3.1c.7 0 1.4.3 1.9.8l1.3 1.3c.5.5 1.2.9 2 .9h4.1A2.8 2.8 0 0 1 21 10.8v6.4A2.8 2.8 0 0 1 18.2 20H5.8A2.8 2.8 0 0 1 3 17.2v-9.4Z"
        fill={active ? '#FFFFFF' : 'none'}
        stroke={active ? '#FFFFFF' : 'currentColor'}
        strokeWidth={active ? '0' : '2.2'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AboutNavIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" className="block shrink-0">
        <circle cx="12" cy="7.2" r="3.8" fill="#FFFFFF" />
        <path
          d="M4.5 20c0-3.5 3.3-6 7.5-6s7.5 2.5 7.5 6a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="block shrink-0">
      <circle cx="12" cy="7.2" r="3.8" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M4.8 20c0-3.3 3.2-5.8 7.2-5.8s7.2 2.5 7.2 5.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems: NavItemConfig[] = [
  { id: 'work', label: 'Home', icon: HomeNavIcon },
  { id: 'experience', label: 'Experience', icon: FolderNavIcon },
  { id: 'about', label: 'About', icon: AboutNavIcon },
];

export const Sidebar = forwardRef<SidebarHandle, SidebarProps>(
  ({ activeSection, scrollToSection, showSecondary = true, isSettled = true, phase = 'done', isScrolled = false }, ref) => {
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
      <aside className="w-full lg:w-[400px] shrink-0 flex flex-col justify-between h-[100dvh] lg:h-screen lg:sticky top-0 pt-0 lg:pt-10 pb-0 lg:pb-0 px-4 sm:px-6 lg:px-10 gap-0 bg-transparent z-[100] lg:z-10 relative">

        {/* TOP SECTION: Header (Mobile Fixed + Desktop Sticky) */}
        <div>
          {/* Mobile Fixed Top Header (sticks to top with smooth background blur transition when scrolled) */}
          <div
            className={`fixed top-0 left-0 right-0 z-[100] lg:hidden px-4 sm:px-6 py-3 sm:py-3.5 flex justify-between items-center transition-all duration-300 ease-out ${isScrolled
              ? 'bg-[#0b0c0e]/85 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/40'
              : 'bg-transparent border-b border-transparent'
              }`}
          >
            <div
              ref={mobileAvatarRef}
              className="w-9 h-9 rounded-full overflow-hidden bg-[#141517] shadow-lg shadow-black/40 shrink-0 cursor-pointer flex items-center justify-center"
              onClick={() => scrollToSection('work')}
              style={{
                opacity: isSettled ? 1 : 0,
                transition: 'opacity 400ms ease-out',
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
              className="flex items-center gap-0 p-0 rounded-full bg-[#141517] shadow-lg shadow-black/40 overflow-hidden"
            >
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    aria-label={item.label}
                    title={item.label}
                    className="relative w-11 h-9 flex items-center justify-center transition-colors cursor-pointer select-none group"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-pill"
                        className="absolute inset-0 rounded-full bg-[#27292e] shadow-sm"
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 32,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 flex items-center justify-center transition-colors duration-200 ${isActive
                        ? 'text-white'
                        : 'text-[#888b93] group-hover:text-white/80'
                        }`}
                    >
                      <IconComponent active={isActive} />
                    </span>
                  </button>
                );
              })}
            </motion.nav>
          </div>

          {/* Spacer so mobile content starts cleanly below the fixed header */}
          <div className="h-14 sm:h-16 lg:hidden shrink-0" />

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
        </div>

        {/* Mobile ambient glow in lower-right so empty dark space has atmospheric warmth */}
        <div className="lg:hidden absolute bottom-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),rgba(255,255,255,0.02),transparent_70%)] pointer-events-none -z-10" />

        {/* MIDDLE SECTION: Vertically centered on mobile, natural flow on desktop */}
        <div className="flex-1 flex flex-col justify-center my-auto lg:my-0 lg:flex-initial text-center lg:text-left items-center lg:items-start px-2 sm:px-0">
          {/* Heading */}
          <div className="mt-0">
            <h1 className="text-[32px] sm:text-[32px] lg:text-4xl font-semibold leading-[1.18] sm:leading-[1.15] tracking-tight text-white">
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
            className="text-[15px] sm:text-base font-normal text-white/60 leading-[1.6] max-w-sm mt-3.5 sm:mt-4 mx-auto lg:mx-0"
          >
            2x Founding Product Designer at fast paced, early-stage startups — across web3 <br className="sm:hidden" />fintech &amp; b2b AI SaaS.
          </motion.p>

          {/* CTA: Lets Talk & Open for work */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 12 }}
            transition={showSecondary
              ? { duration: 0 }
              : { duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="flex flex-col items-center lg:items-start gap-2.5 shrink-0 z-10 mt-5 sm:mt-6"
          >
            <LetsTalkButton className="w-fit shrink-0" />

            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-emerald-400/90">Open for work</span>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SECTION: Mobile bottom row (View projects on left, meworking.png on right) */}
        <div className="lg:hidden flex items-end justify-between shrink-0 relative overflow-visible mt-auto pt-2 pb-0">
          {/* Left: View projects with two downward animated arrows */}
          <motion.button
            type="button"
            onClick={() => scrollToSection('work')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 10 }}
            transition={{ duration: 0.5, delay: showSecondary ? 0.2 : 0 }}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer group select-none pb-3 pl-1 shrink-0"
          >
            <span>View projects</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="flex flex-col items-center -space-y-1.5 text-emerald-400 group-hover:text-emerald-300 transition-colors"
            >
              <ChevronDown size={14} strokeWidth={2.5} />
              <ChevronDown size={14} strokeWidth={2.5} />
            </motion.div>
          </motion.button>

          {/* Right: meworking.png resting right on the bottom line (enlarged for mobile presence) */}
          <div className="overflow-hidden pointer-events-none select-none -mr-4 sm:-mr-6 shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: showSecondary ? 1 : 0, y: showSecondary ? 0 : 50 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: showSecondary ? 0.15 : 0 }}
              className="flex items-end justify-end"
            >
              <img
                src="/meworking.png"
                alt="Abhishek working"
                className="w-[210px] sm:w-[245px] h-auto object-contain object-right-bottom -mb-[2px] pointer-events-none block"
              />
            </motion.div>
          </div>
        </div>

        {/* Mobile divider below hero section — edge-to-edge, only fades in when showSecondary is true */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showSecondary ? 1 : 0 }}
          transition={showSecondary ? { duration: 0.5, ease: 'easeOut', delay: 0.2 } : { duration: 0 }}
          className="lg:hidden -mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] h-px bg-white/[0.08] pointer-events-none shrink-0"
        />

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

