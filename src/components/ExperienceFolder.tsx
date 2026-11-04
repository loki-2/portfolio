import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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
    company: 'Pred - Web3',
    period: '2025 ~ present',
    image: '/pred.png',
    summary:
      'Spearheaded 0→1 product design for a high-frequency sports prediction exchange on Solana. Led trading terminal UX, order discovery, and mobile responsive flows driving $4M+ volume.',
  },
  {
    id: 'dashwave',
    role: 'Founding Product Designer',
    company: 'Dashwave - AI SaaS',
    period: '2024 ~ 2025',
    image: '/dashwavelogo.png',
    summary:
      'Architected IDE interactions for cloud & AI-assisted mobile development workflows. Redesigned developer onboarding, activation funnels, and prompt-to-app collaboration surfaces.',
  },
];

export const ExperienceFolder: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Each card peeks 44px above the one in front; 3 cards need ~190px total
  const CARD_PEEK = 44;
  const stackHeight = EXPERIENCES.length * CARD_PEEK + 10;

  return (
    // Outer wrapper with gray background and padding
    <div
      className="w-full max-w-2xl mx-auto p-3 rounded-[36px] select-none"
      style={{ background: '#08080E' }}
    >
      {/* Inner container */}
      <div className="relative">
        {/* CARDS - at TOP, behind folder (z-0), stacked - all 3 experiences */}
        <div className="relative z-0 px-4 pt-4" style={{ height: `${stackHeight}px` }}>
          {[...EXPERIENCES].reverse().map((exp, idx) => {
            // After reversing: idx 0 = intern (back), 1 = dashwave (mid), 2 = pred (front)
            const originalIdx = EXPERIENCES.length - 1 - idx;
            const isHovered = hoveredIdx === originalIdx;
            const stackOffset = idx * CARD_PEEK;

            return (
              <motion.div
                key={exp.id}
                onMouseEnter={() => setHoveredIdx(originalIdx)}
                onMouseLeave={() => {
                  setTimeout(() => setHoveredIdx(prev => prev === originalIdx ? null : prev), 100);
                }}
                onClick={() => setHoveredIdx(isHovered ? null : originalIdx)}
                className="absolute cursor-pointer"
                animate={{
                  y: isHovered ? stackOffset - 70 : stackOffset,
                  borderRadius: isHovered ? '12px' : '12px 12px 0 0'
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  left: idx === 0 ? '24px' : idx === 1 ? '16px' : '8px',
                  right: idx === 0 ? '24px' : idx === 1 ? '16px' : '8px',
                  zIndex: idx + 1,
                  background: 'linear-gradient(145deg, #1a1d24 0%, #13151a 100%)',
                  boxShadow: isHovered
                    ? '0 20px 50px rgba(0,0,0,0.6)'
                    : '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Logo */}
                    <motion.div
                      animate={{
                        width: isHovered ? 44 : 36,
                        height: isHovered ? 44 : 36,
                      }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="shrink-0 rounded-lg overflow-hidden bg-white/5"
                    >
                      <img
                        src={exp.image}
                        alt={exp.company}
                        className="w-full h-full object-contain"
                      />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title + Year - always visible */}
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[13px] font-semibold text-white/90 tracking-tight">
                          {exp.role}
                        </h4>
                        <span className="text-[10px] text-white/40 shrink-0">
                          {exp.period}
                        </span>
                      </div>

                      {/* Subtext - visible on hover when lifted */}
                      <motion.div
                        initial={false}
                        animate={{
                          height: isHovered ? 'auto' : 0,
                          opacity: isHovered ? 1 : 0,
                        }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-[11px] text-white/50 mt-1">{exp.company}</p>
                        <p className="text-[11px] text-white/55 leading-relaxed mt-1">
                          {exp.summary}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FOLDER SVG - overlaps cards slightly from below (z-10) */}
        <div className="relative z-10 -mt-4 pointer-events-none">
          <img
            src="/Vector 12750.svg"
            alt="Folder"
            className="w-full h-auto"
          />

          {/* Text overlay on folder */}
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Experience
            </h3>
            <p className="text-sm text-white/40 mt-1 tracking-widest">
              2024-Present
            </p>
          </div>
        </div>

        {/* Resume card below the folder */}
        {/* <div className="mt-4 mx-1 bg-white/[0.04] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h4 className="text-base font-medium text-white">Abhishek Edla</h4>
            <p className="text-[10px] text-white/40 tracking-wide uppercase">Product Designer · India</p>
          </div>
          <a
            href="https://drive.google.com/drive/folders/1mEdpp-eo9aFGIEU8GDJ-iVe6l2pwTr_z?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs font-medium text-white pt-3 border-t border-white/10 cursor-pointer group no-underline"
          >
            View resume
            <div className="bg-white text-black p-1 rounded-full group-hover:scale-110 transition-transform">
              <ArrowRight size={12} strokeWidth={3} />
            </div>
          </a>
        </div> */}
      </div>
    </div>
  );
};
