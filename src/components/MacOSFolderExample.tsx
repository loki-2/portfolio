import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2 } from 'lucide-react';
import { MacOSFolder } from './MacOSFolder';

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
  {
    id: 'intern',
    role: 'Design Intern',
    company: 'Dashwave, Wyshlist, K12',
    period: '2022 ~ 2024',
    image: '/other.png',
    summary:
      'Crafted multi-brand design systems, interactive prototypes, and component libraries across early-stage consumer and B2B SaaS applications in fast-paced sprint cycles.',
  },
];

export const MacOSFolderExample: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <MacOSFolder
        label="Experience"
        icon={<FolderGit2 size={11} />}
        className="max-w-2xl mx-auto"
      >
        {/* Cards visible in the back section - stacked appearance */}
        <div className="space-y-2">
          {EXPERIENCES.map((exp, idx) => {
            const isHovered = hoveredIdx === idx;

            return (
              <motion.div
                key={exp.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                animate={{
                  y: isHovered ? -8 : 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`
                  relative rounded-xl cursor-pointer overflow-hidden
                  bg-gradient-to-br from-[#28282e] to-[#22222a] border border-white/[0.08]
                  transition-all duration-300 ease-out
                  ${isHovered ? 'shadow-[0_12px_40px_rgba(0,0,0,0.9)] border-white/[0.15]' : 'shadow-[0_3px_10px_rgba(0,0,0,0.5)]'}
                `}
                style={{
                  padding: isHovered ? '18px' : '14px',
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Logo - small by default, bigger on hover */}
                  <motion.div
                    animate={{
                      width: isHovered ? 48 : 36,
                      height: isHovered ? 48 : 36,
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="shrink-0 rounded-lg overflow-hidden border border-white/[0.1] bg-white/[0.03] flex items-center justify-center"
                  >
                    <img
                      src={exp.image}
                      alt={exp.company}
                      className="w-full h-full object-contain p-1.5"
                    />
                  </motion.div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Year - always visible */}
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-[15px] font-semibold text-white/90 tracking-tight">
                        {exp.role}
                      </h4>
                      <span className="text-[11px] text-white/40 shrink-0 font-medium">
                        {exp.period}
                      </span>
                    </div>

                    {/* Company and summary - only visible on hover */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        height: isHovered ? 'auto' : 0,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1 border-t border-white/[0.08] mt-2">
                        <p className="text-sm text-white/50 mb-2">
                          {exp.company}
                        </p>
                        <p className="text-[13px] text-white/60 leading-relaxed">
                          {exp.summary}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </MacOSFolder>
    </div>
  );
};

export default MacOSFolderExample;
