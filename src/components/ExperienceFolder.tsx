import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  image: string;
  summary: string;
}

const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'pred',
    role: 'Founding Product Designer',
    company: 'Pred · Web3',
    period: '2025 ~ present',
    image: '/pred.png',
    summary:
      'Designed a Prediction Exchange from V0 to V2 across web and mobile, scaling to 10K+ users and driving $7.45M+ in trading volume during the FIFA World Cup.',
  },
  {
    id: 'dashwave',
    role: 'Founding Product Designer',
    company: 'Dashwave · AI SaaS',
    period: '2024 ~ 2025',
    image: '/dashwavelogo.png',
    summary:
      'Led design from MVP to Product Pivot. Worked on 10s of projects, funnel conversion experiments and design systems.',
  },
];

export const ExperienceFolder: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedMobileExp, setSelectedMobileExp] = useState<ExperienceItem | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMobileExp(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="relative w-full max-w-[540px] mx-auto select-none pt-2 sm:pt-4">
        {/* Main Folder Container - Preserves 541/451 aspect ratio */}
        <div className="relative w-full aspect-[541/451]">
          {/* 1. BACK OF FOLDER SVG */}
          <img
            src="/Vector%2012751.svg"
            alt="Folder Back"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          />

          {/* 2. CARDS SITTING INSIDE THE FOLDER */}
          {/* idx 0: Dashwave (Back card, zIndex: 5), idx 1: Pred (Front card, zIndex: 10) */}
          {[...EXPERIENCES].reverse().map((exp, idx) => {
            const originalIdx = EXPERIENCES.length - 1 - idx;
            const isHovered = hoveredIdx === originalIdx;
            const isDashwave = idx === 0;

            const topOffset = isDashwave ? '13%' : '29%';
            const sideOffset = isDashwave ? '4.8%' : '3.6%';
            // Natural zIndex: Dashwave stays behind Pred (5 vs 10), both stay behind front flap (20)
            const cardZIndex = isDashwave ? 5 : 10;

            // Background color covers 100% of the card evenly with no breaks - default card colors
            const cardBg = isDashwave
              ? 'linear-gradient(145deg, #172238 0%, #121929 50%, #101218 100%)'
              : 'linear-gradient(145deg, #242617 0%, #1C1E12 50%, #101218 100%)';

            return (
              <motion.div
                key={exp.id}
                onMouseEnter={() => setHoveredIdx(originalIdx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setSelectedMobileExp(exp)}
                animate={{
                  y: isHovered ? -90 : 0,
                  borderRadius: isHovered ? '14px' : '14px 14px 0 0',
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute cursor-pointer overflow-hidden p-3.5 sm:p-4"
                style={{
                  top: topOffset,
                  left: sideOffset,
                  right: sideOffset,
                  minHeight: '175px', // Extends down behind next card / front flap so there is zero gap
                  zIndex: cardZIndex,
                  background: cardBg,
                  boxShadow: isHovered ? '0 16px 36px rgba(0,0,0,0.65)' : '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                {/* Full-width continuous light sweep on hover */}
                {isHovered && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-y-0 w-full pointer-events-none"
                    style={{
                      background: isDashwave
                        ? 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.12) 50%, transparent 100%)'
                        : 'linear-gradient(90deg, transparent 0%, rgba(229, 232, 46, 0.12) 50%, transparent 100%)',
                    }}
                  />
                )}

                {/* Row 1: Logo + Role Title + Date - Vertically Center-Aligned */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Logo - 8px rounded outer div & rounded logo */}
                    <motion.div
                      animate={{
                        width: isHovered ? 40 : 36,
                        height: isHovered ? 40 : 36,
                      }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="shrink-0 rounded-[8px] overflow-hidden bg-white/5 p-1 flex items-center justify-center"
                    >
                      <img
                        src={exp.image}
                        alt={exp.company}
                        className="w-full h-full object-contain rounded-[6px]"
                      />
                    </motion.div>

                    {/* Role Title */}
                    <h4 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight truncate">
                      {exp.role}
                    </h4>
                  </div>

                  {/* Date / Period */}
                  <span className="text-[11px] sm:text-xs text-white/50 shrink-0 font-mono">
                    {exp.period}
                  </span>
                </div>

                {/* Subtext - Expands smoothly on hover */}
                <motion.div
                  initial={false}
                  animate={{
                    height: isHovered ? 'auto' : 0,
                    opacity: isHovered ? 1 : 0,
                    marginTop: isHovered ? 10 : 0,
                  }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 overflow-hidden"
                >
                  <p className="text-[14px] sm:text-[13px] text-white/60 font-medium">{exp.company}</p>
                  <p className="text-[14px] sm:text-[13px] text-white/70 leading-relaxed mt-1 font-normal">
                    {exp.summary}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}

          {/* 3. FRONT PART OF FOLDER (3D POCKET IN CODE, zIndex: 20) */}
          <div
            onClick={() => setSelectedMobileExp(EXPERIENCES[0])}
            className="absolute z-20 cursor-pointer sm:cursor-default rounded-[18px] sm:rounded-[22px] overflow-hidden flex flex-col justify-between"
            style={{
              top: '47%',
              left: '2.5%',
              right: '2.5%',
              bottom: '2.5%',
              background: 'linear-gradient(180deg, #1C1E23 0%, #141518 100%)',
              boxShadow:
                '0 -8px 24px -2px rgba(0, 0, 0, 0.65), 0 12px 28px rgba(0, 0, 0, 0.45)',
            }}
          >
            {/* Top specular highlight edge */}
            <div className="w-full h-[1px] bg-white/[0.06]" />

            {/* Bottom info on folder pocket */}
            <div className="p-5 sm:p-6 flex items-end justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Experience
                </h3>
                <p className="text-xs text-white/40 mt-2 font-mono tracking-wider">
                  2024 — Present
                </p>
              </div>

              {/* Hover to peek cue */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/35 font-medium">
                <span>Hover to peek</span>
                <span className="text-white/25">↑</span>
              </div>
              <div className="flex sm:hidden items-center gap-1 text-[11px] text-white/40 font-medium">
                <span>Tap to view</span>
                <span className="text-white/30">↗</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MOBILE / CLICK EXPAND OVERLAY MODAL */}
      <AnimatePresence>
        {selectedMobileExp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedMobileExp(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl p-6 sm:p-8 flex flex-col gap-4"
              style={{
                background:
                  selectedMobileExp.id === 'dashwave'
                    ? 'linear-gradient(145deg, #172238 0%, #121929 50%, #101218 100%)'
                    : 'linear-gradient(145deg, #242617 0%, #1C1E12 50%, #101218 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Close (X) cross button */}
              <button
                onClick={() => setSelectedMobileExp(null)}
                aria-label="Close"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Header: Logo, Title, Period, Company */}
              <div className="flex items-start gap-3.5 pr-8">
                <div className="w-11 h-11 rounded-[8px] bg-white/5 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={selectedMobileExp.image}
                    alt={selectedMobileExp.company}
                    className="w-full h-full object-contain rounded-[6px]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                      {selectedMobileExp.role}
                    </h3>
                    <span className="text-xs text-white/50 font-mono shrink-0">
                      {selectedMobileExp.period}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/55 font-medium mt-0.5">
                    {selectedMobileExp.company}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal pt-1">
                {selectedMobileExp.summary}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
