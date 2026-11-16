import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProjectTags } from '@/components/ProjectTag';
import type { WorkItem, NotionProject } from '@/lib/types';
import { getAllProjectsFromCache } from '@/lib/supabase';
import { AuroraCardBackground, AURORA_THEMES, type AuroraTheme } from './AuroraCardBackground';
import { ExperienceFolder } from './ExperienceFolder';
import { AboutSection } from './AboutSection';
import { FooterCTA } from './FooterCTA';

import {
  PROJECT_ORDER,
  DEFAULT_WORK_ITEMS,
  getCoverImageForProject,
  getCarouselImagesForProject,
  getCleanPageId,
} from '@/lib/projects';

function projectToWorkItem(
  p: Omit<NotionProject, 'blocks' | 'updatedAt'>,
  index: number
): WorkItem {
  return {
    title: p.title,
    description: p.subtext,
    tags: p.tags,
    coverImage: getCoverImageForProject(p.notionPageId, index),
    carouselImages: getCarouselImagesForProject(p.notionPageId),
    carouselBg: 'bg-white',
    notionPageId: p.notionPageId,
  };
}

// ─── Reusable Carousel Card Item ─────────────────────────────────────────────
const CarouselCardItem: React.FC<{
  src: string;
  carouselBg?: string;
  size?: 'desktop-hero' | 'desktop-subtle' | 'mobile';
}> = ({ src, carouselBg = 'bg-white', size = 'desktop-hero' }) => {
  const isClass = carouselBg.startsWith('bg-');
  const style = !isClass ? { background: carouselBg } : undefined;

  let sizeClasses = '';
  if (size === 'desktop-hero') {
    sizeClasses = 'w-[510px] xl:w-[570px] h-[310px] xl:h-[345px] px-3.5 py-0 rounded-xl shadow-2xl';
  } else if (size === 'desktop-subtle') {
    sizeClasses = 'w-[340px] xl:w-[380px] h-[190px] xl:h-[210px] px-2.5 py-0 rounded-lg shadow-lg';
  } else {
    // mobile
    sizeClasses = 'w-[230px] sm:w-[260px] h-[145px] sm:h-[160px] px-2 py-0 rounded-lg shadow-md';
  }

  return (
    <div
      className={`flex items-center justify-center border border-black/10 shrink-0 select-none overflow-hidden transition-all duration-300 ${sizeClasses} ${isClass ? carouselBg : ''}`}
      style={style}
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-contain rounded-[8px] pointer-events-none block"
      />
    </div>
  );
};

// ─── Desktop Stacked Hero Carousel ──────────────────────────────────────────
const DesktopStackedCarousel: React.FC<{
  images: string[];
  carouselBg?: string;
  isHovered: boolean;
}> = ({ images, carouselBg = 'bg-white', isHovered }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  return (
    <div
      className="relative hidden lg:flex flex-1 h-[480px] overflow-hidden items-center justify-center z-10 pointer-events-none"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {images.map((src, i) => {
          let diff = i - activeIndex;
          if (diff > images.length / 2) diff -= images.length;
          if (diff < -images.length / 2) diff += images.length;

          const isCenter = diff === 0;
          const isTop = diff === -1;
          const isBottom = diff === 1;

          let y = 0;
          let scale = 1;
          let opacity = 0;
          let zIndex = 1;

          if (isCenter) {
            y = 0;
            scale = 1;
            opacity = 1;
            zIndex = 10;
          } else if (isTop) {
            y = -225;
            scale = 0.84;
            opacity = 0.45;
            zIndex = 3;
          } else if (isBottom) {
            y = 225;
            scale = 0.84;
            opacity = 0.45;
            zIndex = 3;
          } else {
            y = diff < 0 ? -360 : 360;
            scale = 0.7;
            opacity = 0;
            zIndex = 0;
          }

          return (
            <motion.div
              key={src + '-' + i}
              initial={false}
              animate={{
                y,
                scale,
                opacity,
                zIndex,
              }}
              transition={{
                duration: 0.72,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute flex items-center justify-center"
              style={{
                pointerEvents: 'none',
              }}
            >
              <CarouselCardItem
                src={src}
                carouselBg={carouselBg}
                size={isCenter ? 'desktop-hero' : 'desktop-subtle'}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Desktop Full-Width WorkCard (Top 2 projects) ───────────────────────────
const WorkCard: React.FC<WorkItem & { index: number }> = ({
  title,
  tags,
  description,
  coverImage,
  carouselImages: propCarouselImages,
  carouselBg = 'bg-white',
  notionPageId,
  index,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const theme = AURORA_THEMES[index % 3] ?? AURORA_THEMES[0];
  const cleanId = notionPageId.replace(/-/g, '');

  const rawImages =
    propCarouselImages && propCarouselImages.length > 0
      ? propCarouselImages
      : getCarouselImagesForProject(notionPageId);

  const mobileCards = [...rawImages, ...rawImages, ...rawImages];

  const renderArrowButton = () => (
    <motion.div
      className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0"
      animate={{
        scale: isHovered ? 1.1 : 1,
        backgroundColor: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
        color: isHovered ? '#000000' : '#9c9c9c',
      }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flex items-center justify-center"
        style={{ transformOrigin: 'center' }}
        animate={{
          rotate: isHovered ? -45 : 0,
        }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <ArrowRight size={16} strokeWidth={2.5} />
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      layoutId={`card-${cleanId}`}
      onClick={() =>
        navigate(`/project/${notionPageId}`, {
          state: { index, title, tags, description, coverImage },
        })
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        e.key === 'Enter' &&
        navigate(`/project/${notionPageId}`, {
          state: { index, title, tags, description, coverImage },
        })
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full rounded-xl overflow-hidden cursor-pointer hover:scale-[1.005] active:scale-[0.998] flex flex-col lg:flex-row lg:items-stretch lg:h-[480px]"
      style={{ willChange: 'transform' }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Inner white border overlay */}
      <motion.div
        layoutId={`card-border-${cleanId}`}
        className="absolute inset-0 rounded-xl pointer-events-none z-20"
      />

      {/* Aurora background */}
      <AuroraCardBackground theme={theme} isHovered={isHovered} />

      {/* Left text on desktop / Top text on mobile */}
      <div className="flex flex-col justify-between p-6 sm:p-7 lg:p-9 w-full lg:w-[40%] xl:w-[38%] shrink-0 z-10">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="flex items-start justify-between gap-4">
            <motion.h3
              layoutId={`card-title-${cleanId}`}
              className="text-2xl lg:text-3xl font-semibold text-white leading-tight max-w-xs pt-2 lg:pt-4"
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              {title}
            </motion.h3>
            {/* Mobile arrow beside card title */}
            <div className="lg:hidden shrink-0 pt-2">
              {renderArrowButton()}
            </div>
          </div>
          <ProjectTags tags={tags} layoutId={`card-tags-${cleanId}`} />
        </div>

        {/* Bottom on desktop: Arrow icon button */}
        <div className="hidden lg:flex lg:mt-0 items-center">
          {renderArrowButton()}
        </div>
      </div>

      {/* Desktop Stacked Hero Carousel */}
      <DesktopStackedCarousel
        images={rawImages}
        carouselBg={carouselBg}
        isHovered={isHovered}
      />

      {/* Mobile Horizontal Carousel (moving left to right) */}
      <div
        className="lg:hidden w-full overflow-hidden px-4 pb-6 pt-1 z-10 pointer-events-none"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div
          className="animate-marquee-right flex gap-3 sm:gap-4 items-center"
          style={{
            animationPlayState: isHovered ? 'running' : 'paused',
            animationDuration: '18s',
          }}
        >
          {mobileCards.map((src, idx) => (
            <CarouselCardItem
              key={idx}
              src={src}
              carouselBg={carouselBg}
              size="mobile"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Mobile Project Card Variant (Custom Project Card) ──────────────────────
interface MobileVariantProjectCardProps {
  title: string;
  tags: string[];
  description?: string;
  carouselImages: string[];
  carouselBg?: string;
  auroraTheme?: AuroraTheme;
  notionPageId?: string;
  href?: string;
  index?: number;
}

const MobileVariantProjectCard: React.FC<MobileVariantProjectCardProps> = ({
  title,
  tags,
  description,
  carouselImages,
  carouselBg = 'bg-white',
  auroraTheme,
  notionPageId,
  href,
  index = 0,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const theme = auroraTheme ?? AURORA_THEMES[index % 3] ?? AURORA_THEMES[0];

  const handleClick = () => {
    if (notionPageId) {
      navigate(`/project/${notionPageId}`, {
        state: { index, title, tags, description },
      });
    } else if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const renderArrowButton = () => (
    <motion.div
      className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0"
      animate={{
        scale: isHovered ? 1.1 : 1,
        backgroundColor: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
        color: isHovered ? '#000000' : '#9c9c9c',
      }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flex items-center justify-center"
        style={{ transformOrigin: 'center' }}
        animate={{
          rotate: isHovered ? -45 : 0,
        }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <ArrowRight size={16} strokeWidth={2.5} />
      </motion.div>
    </motion.div>
  );

  const repeatedImages = [...carouselImages, ...carouselImages, ...carouselImages];

  return (
    <motion.div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.005] active:scale-[0.998] flex flex-col justify-between"
    >
      {/* Inner white border overlay */}
      <div className="absolute inset-0 rounded-xl pointer-events-none z-20" />

      {/* Aurora background */}
      <AuroraCardBackground theme={theme} isHovered={isHovered} />

      {/* Header: Title + tags + Arrow */}
      <div className="flex flex-col justify-between p-6 sm:p-7 z-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl lg:text-2xl font-semibold text-white leading-tight max-w-xs">
              {title}
            </h3>
            <div className="shrink-0 pt-0.5">
              {renderArrowButton()}
            </div>
          </div>
          <ProjectTags tags={tags} />
        </div>
      </div>

      {/* Horizontal Carousel moving left to right */}
      <div
        className="relative w-full overflow-hidden px-4 pb-6 pt-1 z-10 pointer-events-none"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div
          className="animate-marquee-right flex gap-3 sm:gap-4 items-center"
          style={{
            animationPlayState: isHovered ? 'running' : 'paused',
            animationDuration: '18s',
          }}
        >
          {repeatedImages.map((src, idx) => (
            <CarouselCardItem
              key={idx}
              src={src}
              carouselBg={carouselBg}
              size="mobile"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── External / Static Projects ─────────────────────────────────────────────
const SPOTIFY_PROJECT = {
  title: 'Spotify vibes - Elevating listeners experience',
  tags: ['Mobile', 'Concept'],
  carouselImages: ['/spotify.png', '/cover_spotify.png', '/spotify.png', '/cover_spotify.png'],
  carouselBg: 'bg-white',
  href: 'https://medium.com/design-bootcamp/introducing-spotify-vibes-a-new-feature-to-elevate-the-listeners-experience-19286d87d1ef',
  auroraTheme: {
    baseBg: '#111214',
    primaryColor: '#1dd65e',
    secondaryColor: '#06a340',
    glowRgba: 'rgba(29, 214, 94, 0.45)',
  },
};

// 5th Project (Dashwave) commented out per request:
/*
const DASHWAVE_PROJECT = {
  title: 'Improving User Activation on Dashwave',
  tags: ['SaaS', 'B2B'],
  carouselImages: ['/dashwave.png', '/cover_spotify.png', '/dashwave.png', '/cover_spotify.png'],
  carouselBg: 'bg-white',
  href: 'https://medium.com/@abhishek.edla1203/dashwave-1-0-8730d5f50183',
  auroraTheme: AURORA_THEMES[2],
};
*/

let memoryWorkItems: WorkItem[] = DEFAULT_WORK_ITEMS;

// Preload project card images into browser HTTP cache immediately
if (typeof window !== 'undefined') {
  const imagesToPreload = [
    '/cas1/1.png',
    '/cas1/2.png',
    '/cas1/3.png',
    '/cas1/4.png',
    '/cover_ai_chat.png',
    '/cover_ai_chat1.png',
    '/cover_spotify.png',
    '/spotify.png',
    '/dashwave.png',
  ];
  imagesToPreload.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

// ─── Content Area ─────────────────────────────────────────────────────────────
export const ContentArea: React.FC = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(memoryWorkItems);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAllProjectsFromCache()
      .then((projects: string | any[]) => {
        if (!cancelled && projects.length > 0) {
          // Sort by the fixed display order
          const sorted = [...projects].sort((a, b) => {
            const ai = PROJECT_ORDER.indexOf(getCleanPageId(a.notionPageId));
            const bi = PROJECT_ORDER.indexOf(getCleanPageId(b.notionPageId));
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          });
          const mapped = sorted.map(projectToWorkItem);
          memoryWorkItems = mapped;
          setWorkItems((prev) => {
            const isSame =
              prev.length === mapped.length &&
              prev.every(
                (item, i) =>
                  item.notionPageId === mapped[i].notionPageId &&
                  item.title === mapped[i].title &&
                  JSON.stringify(item.tags) === JSON.stringify(mapped[i].tags)
              );
            return isSame ? prev : mapped;
          });
        }
      })
      .catch((err: Error) => {
        if (!cancelled && memoryWorkItems.length === 0) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex-1 min-w-0 w-full max-w-full pb-4 pt-4 lg:pt-8 px-4 lg:px-6 flex flex-col gap-5 lg:gap-6 relative min-h-full">
      <div className="flex flex-col gap-5 lg:gap-6 relative z-10 w-full">
        {/* WORK SECTION */}
        <section id="work" className="scroll-mt-10 flex flex-col gap-5 lg:gap-6 relative z-10">
          {error && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-white/40">Couldn't load projects: {error}</p>
            </div>
          )}

          {/* Top full-width project cards: Card 1 & Card 2 */}
          {!error &&
            workItems
              .slice(0, 2)
              .map((item, index) => (
                <WorkCard key={item.notionPageId} {...item} index={index} />
              ))}

          {/* ── Mobile Project Card Variants in 2-Col Grid ── */}
          {!error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
              {/* Slot 1: Third project card ("Designing for Human-AI Collaboration") */}
              {(() => {
                const thirdProject = workItems[2] || DEFAULT_WORK_ITEMS[2];
                return (
                  <MobileVariantProjectCard
                    key={thirdProject.notionPageId}
                    title={thirdProject.title}
                    tags={thirdProject.tags}
                    description={thirdProject.description}
                    notionPageId={thirdProject.notionPageId}
                    carouselImages={
                      thirdProject.carouselImages ||
                      getCarouselImagesForProject(thirdProject.notionPageId)
                    }
                    carouselBg={thirdProject.carouselBg || 'bg-white'}
                    auroraTheme={AURORA_THEMES[2]}
                    index={2}
                  />
                );
              })()}

              {/* Slot 2: Spotify vibes project */}
              <MobileVariantProjectCard
                key={SPOTIFY_PROJECT.href}
                title={SPOTIFY_PROJECT.title}
                tags={SPOTIFY_PROJECT.tags}
                href={SPOTIFY_PROJECT.href}
                carouselImages={SPOTIFY_PROJECT.carouselImages}
                carouselBg={SPOTIFY_PROJECT.carouselBg}
                auroraTheme={SPOTIFY_PROJECT.auroraTheme}
                index={3}
              />

              {/* 5th project (Dashwave) commented out:
              <MobileVariantProjectCard
                key={DASHWAVE_PROJECT.href}
                title={DASHWAVE_PROJECT.title}
                tags={DASHWAVE_PROJECT.tags}
                href={DASHWAVE_PROJECT.href}
                carouselImages={DASHWAVE_PROJECT.carouselImages}
                carouselBg={DASHWAVE_PROJECT.carouselBg}
                auroraTheme={DASHWAVE_PROJECT.auroraTheme}
                index={4}
              />
              */}
            </div>
          )}
        </section>



        {/* EXPERIENCE SECTION */}
        <motion.section
          id="experience"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="scroll-mt-10 relative z-10"
        >
          <div className="bg-[#111214] rounded-xl p-6 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-16">

            {/* Left: Title & Resume */}
            <div className="w-full lg:w-[33%] flex flex-col justify-between gap-8 lg:gap-12 shrink-0">
              <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">Experience</h2>

              <a
                href="https://drive.google.com/drive/folders/1mEdpp-eo9aFGIEU8GDJ-iVe6l2pwTr_z?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden relative group cursor-pointer no-underline h-[140px] border-[2px] border-white/20"
              >
                {/* Resume image */}
                <img
                  src="/resume.png"
                  alt="Resume"
                  className="w-full h-full object-cover object-top"
                />

                {/* Black gradient overlay - full height */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.2) 100%)',
                  }}
                />

                {/* Text + icon at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Resume</span>
                  <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <ArrowRight size={12} strokeWidth={3} className="transition-transform duration-300 group-hover:-rotate-45" />
                  </div>
                </div>
              </a>
            </div>

            {/* Right: Experience Folder */}
            <div className="w-full lg:w-[67%] flex flex-col justify-center">
              <ExperienceFolder />
            </div>

          </div>
        </motion.section>

        {/* HOW I USE AI SECTION */}
        <motion.section
          id="ai"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="scroll-mt-10 relative z-10"
        >
          <div className="bg-[#111214] rounded-xl p-6 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-16">

            {/* Left: Title */}
            <div className="w-full lg:w-1/3 shrink-0">
              <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">How I use AI</h2>
            </div>

            {/* Right: 3 Rows */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6 min-w-0">

              {/* Row 1: Shipping UI faster */}
              <div className="flex flex-col gap-2 pb-8 lg:pb-10 border-b border-white/5">
                <div className="flex gap-5 lg:gap-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 overflow-hidden rounded-[14px] bg-white/[0.04] border-2 border-white/10 flex items-center justify-center">
                    <img src="/claudecode.png" alt="Claude Code" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    <h3 className="text-xl font-medium text-white">Shipping production UI</h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      I use Claude Code to implement UI fixes, polish motion interactions, and ship to production in case of less tech bandwidth.
                    </p>
                  </div>
                </div>
                <div className="h-24 mt-4 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                  <span className="text-xs text-white/20">GitHub Contributions</span>
                </div>
              </div>

              {/* Row 2: Building full-stack projects */}
              <div className="flex flex-col gap-2 pb-8 lg:pb-10 border-b border-white/5">
                <div className="flex gap-5 lg:gap-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 overflow-hidden rounded-[14px] bg-white/[0.04] border-2 border-white/10 flex items-center justify-center">
                    <img src="/antigravity.png" alt="Antigravity" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    <h3 className="text-xl font-medium text-white">Building full-stack personal projects</h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      I use Antigravity to build my personal projects end-to-end. It's become my playground for experimenting, shipping, and learning through real products.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="h-24 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                    <span className="text-[10px] text-white/20">Image 1</span>
                  </div>
                  <div className="h-24 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                    <span className="text-[10px] text-white/20">Image 2</span>
                  </div>
                  <div className="h-24 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                    <span className="text-[10px] text-white/20">Image 3</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Generating visual assets */}
              <div className="flex flex-col gap-2 pb-8 lg:pb-10">
                <div className="flex gap-5 lg:gap-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 overflow-hidden rounded-[14px] bg-white/[0.04] border-2 border-white/10 flex items-center justify-center">
                    <img src="/gemini.png" alt="Gemini" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    <h3 className="text-xl font-medium text-white">Creating product visual assets</h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      I use Gemini to generate product graphics, illustrations, and 3D icons faster.
                    </p>
                  </div>
                </div>
                <div className="mt-4 overflow-hidden">
                  <div className="flex gap-3 animate-carousel w-max">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="w-20 h-20 shrink-0 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center"
                      >
                        <span className="text-[10px] text-white/20">Asset {i}</span>
                      </div>
                    ))}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={`dup-${i}`}
                        className="w-20 h-20 shrink-0 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center"
                      >
                        <span className="text-[10px] text-white/20">Asset {i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.section>

        {/* ABOUT SECTION */}
        <motion.section
          id="about"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="scroll-mt-10 relative z-10"
        >
          <AboutSection />
        </motion.section>

        {/* CTA SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-6 relative z-20"
        >
          <FooterCTA />
        </motion.section>
      </div>
    </main>
  );
};