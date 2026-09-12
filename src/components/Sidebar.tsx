import React from 'react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

const navItems = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
];

const baseTrans = (delay: number): Transition => ({
  duration: 0.7,
  delay,
  ease: 'easeOut',
});

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, scrollToSection }) => {
  return (
    <aside className="w-full lg:w-[400px] shrink-0 flex flex-col lg:justify-between lg:h-screen lg:sticky top-0 py-6 lg:py-10 px-5 lg:px-10 gap-6 lg:gap-0 bg-background z-10">

      {/* TOP SECTION */}
      <div className="flex flex-col gap-6 lg:gap-6">

        {/* Mobile: Avatar + Nav row */}
        <div className="flex justify-between items-start lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={baseTrans(0)}
            className="w-12 h-12 rounded-full overflow-hidden bg-white/10 ring-1 ring-white/20 shrink-0"
          >
            <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-cover" />
          </motion.div>

          <nav className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-5 py-2.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-medium transition-colors ${activeSection === item.id ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Desktop: Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={baseTrans(0)}
          className="hidden lg:block w-12 h-12 rounded-full overflow-hidden bg-white/10 ring-1 ring-white/20 shrink-0"
        >
          <img src="/avatar.png" alt="Abhishek" className="w-full h-full object-cover" />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={baseTrans(0.12)}
          className="mt-2 lg:mt-3"
        >
          <h1 className="text-3xl lg:text-4xl font-semibold leading-[1.15] tracking-tight text-white">
            Hey! I'm Abhishek.<br className="hidden lg:block" />
            <span className="text-white/48 font-medium lg:ml-0 ml-2">
              Product Designer &amp; Builder.
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={baseTrans(0.22)}
          className="text-base font-semibold text-white/48 leading-relaxed max-w-sm"
        >
          3+ years of experience in designing products at fast-paced, high-ownership startups—from MVP to Growth.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={baseTrans(0.32)}
          className="flex flex-col gap-4 lg:gap-3 pt-2"
        >
          <Button
            asChild
            className="w-fit rounded-full bg-white text-black text-sm font-bold px-5 py-2 h-auto hover:bg-white/85 transition-colors"
          >
            <a
              href="https://www.linkedin.com/in/abhishek-edla-334126214/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Let's Chat
            </a>
          </Button>

          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-sm text-emerald-400/80">Exploring high-agency roles</span>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM — Footer */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={baseTrans(0.42)}
        className="flex flex-col gap-6 lg:gap-5"
      >
        <div className="hidden lg:flex items-center justify-between text-[11px] text-white/30">
          <a
            href="https://www.linkedin.com/in/abhishek-edla-334126214/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition-colors"
            title="LinkedIn"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>

          <a
            href="mailto:abhishek.edla1203@gmail.com"
            className="text-sm hover:text-white/60 transition-colors truncate max-w-[240px]"
          >
            abhishek.edla1203@gmail.com
          </a>
        </div>
      </motion.div>
    </aside>
  );
};
