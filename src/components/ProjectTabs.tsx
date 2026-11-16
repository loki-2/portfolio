import React from 'react';
import { motion } from 'framer-motion';

interface ProjectTabsProps {
  activeTab: 'quick' | 'detailed';
  onChange: (tab: 'quick' | 'detailed') => void;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  activeTab,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-start my-4 sm:my-6">
      <div className="inline-flex p-1 rounded-full bg-[#151619] border border-white/[0.08] shadow-inner">
        <button
          type="button"
          onClick={() => onChange('quick')}
          className={`relative px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 select-none cursor-pointer ${
            activeTab === 'quick' ? 'text-black' : 'text-white/60 hover:text-white'
          }`}
        >
          {activeTab === 'quick' && (
            <motion.div
              layoutId="project-mode-pill"
              className="absolute inset-0 bg-white rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <span className="relative z-10">Quick Read</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('detailed')}
          className={`relative px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 select-none cursor-pointer ${
            activeTab === 'detailed' ? 'text-black' : 'text-white/60 hover:text-white'
          }`}
        >
          {activeTab === 'detailed' && (
            <motion.div
              layoutId="project-mode-pill"
              className="absolute inset-0 bg-white rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <span className="relative z-10">Detailed</span>
        </button>
      </div>
    </div>
  );
};
