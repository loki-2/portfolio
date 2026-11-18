import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail } from 'lucide-react';
import { LetsTalkButton } from './LetsTalkButton';

export const FooterCTA: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { amount: 0.15 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || window.matchMedia('(hover: none)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full group"
    >
      {/* Memoji avatar rising from behind the back of this section towards the top right, overlapping above the section before it */}
      <motion.div
        className="absolute -top-22 sm:-top-28 lg:-top-32 right-0 sm:right-12 lg:right-8 z-10 pointer-events-none select-none"
        initial={false}
        animate={
          isMobile
            ? isInView
              ? {
                  y: [110, 0, 0, 110, 110],
                  opacity: 1,
                  scale: 1,
                }
              : { y: 110, opacity: 1, scale: 1 }
            : isHovered
              ? { y: 0, opacity: 1, scale: 1 }
              : { y: 110, opacity: 0, scale: 0.9 }
        }
        transition={
          isMobile && isInView
            ? {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.25, 0.65, 0.9, 1],
              }
            : {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }
        }
      >
        <img
          src="/footer.png"
          alt="Abhishek waving"
          className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 object-contain object-bottom drop-shadow-2xl"
        />
      </motion.div>

      {/* Main CTA Card in front of image lower body (z-20) */}
      <div className="w-full rounded-2xl p-5 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8 relative z-20 overflow-hidden bg-gradient-to-br from-[#0F3F2D] to-[#0A261B] border border-emerald-500/20 shadow-lg transition-all duration-300">
        {/* Ambient background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Left: 2 lines of text */}
        <div className="flex flex-col gap-2 sm:gap-4 z-10 min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-[34px] xl:text-[38px] font-semibold text-white tracking-tight leading-snug lg:leading-[44px] h-auto lg:h-[44px] flex items-center whitespace-normal lg:whitespace-nowrap">
            Need a designer who takes ownership?
          </h2>
          <p className="text-xl sm:text-2xl lg:text-[34px] xl:text-[38px] font-semibold text-white tracking-tight leading-snug lg:leading-[44px] h-auto lg:h-[44px] flex items-center whitespace-normal lg:whitespace-nowrap">
            I'd love to be your guy.
          </p>
        </div>

        {/* Right: Lets Talk button (Row 1, 44px) + Social Icons (Row 2, 44px) with gap-4 */}
        <div className="flex flex-col items-start lg:items-end gap-4 shrink-0 z-10 w-full sm:w-auto">
          {/* Row 1: Button with matching 44px height */}
          <div className="h-[44px] flex items-center">
            <LetsTalkButton className="h-[44px] px-6 text-sm font-bold flex items-center justify-center" />
          </div>

          {/* Row 2: Social Icons row with matching 44px height and generous gap */}
          <div className="h-[44px] flex items-center gap-2.5">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/abhishek-edla-334126214/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/[0.08] hover:border-white/25 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
              </svg>
            </a>

            {/* X (formerly Twitter) */}
            <a
              href="https://x.com/abhihere098"
              target="_blank"
              rel="noopener noreferrer"
              title="X (formerly Twitter)"
              aria-label="X (formerly Twitter)"
              className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/[0.08] hover:border-white/25 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:abhishek.edla1203@gmail.com"
              title="Email"
              aria-label="Email"
              className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/[0.08] hover:border-white/25 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
