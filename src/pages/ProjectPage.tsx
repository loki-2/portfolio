import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap } from 'lucide-react';
import { ProjectTags } from '@/components/ProjectTag';
import { getCachedProject, upsertProject, getAllProjectsFromCache } from '@/lib/supabase';
import { getProjectWithBlocks } from '@/lib/notion';
import { SectionContent, groupProjectBlocksIntoTabs } from '@/components/NotionRenderer';
import { ProjectTabs } from '@/components/ProjectTabs';
import type { NotionProject, ProjectSection, NotionBlock } from '@/lib/types';
import { TwitterTickerSection } from '@/components/TwitterTicker';
import {
  PROJECT_ORDER,
  COVER_IMAGES,
  getCoverImageForProject,
  getCarouselImagesForProject,
  getCarouselBgForProject,
  getProjectIndex,
  getCleanPageId,
} from '@/lib/projects';
import { useSmoothScroll } from '@/lib/useSmoothScroll';

// ─── Hero Banner with 3-Card Rotating Carousel ────────────────────────────────
function HeroBanner({
  coverImage,
  notionPageId,
}: {
  coverImage?: string;
  notionPageId: string;
  index?: number;
}) {
  const cleanId = notionPageId ? notionPageId.replace(/-/g, '') : '';
  const carouselImages = getCarouselImagesForProject(notionPageId);
  const carouselBg = getCarouselBgForProject(notionPageId);

  // Fallback to coverImage if carouselImages empty
  const rawImages =
    carouselImages && carouselImages.length > 0
      ? carouselImages
      : coverImage
        ? [coverImage]
        : [];

  const displayImages =
    rawImages.length === 2 ? [...rawImages, ...rawImages] : rawImages;

  const [activeIndex, setActiveIndex] = useState(0);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 640) setScreenSize('mobile');
      else if (w < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-rotate the carousel
  useEffect(() => {
    if (displayImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayImages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [displayImages.length]);

  const xOffset =
    screenSize === 'mobile' ? 190 : screenSize === 'tablet' ? 290 : 380;

  const isClass = carouselBg.startsWith('bg-');
  const cardStyle = !isClass ? { backgroundColor: carouselBg } : undefined;

  // Calculate diff and sort so center hero card renders last in DOM (guaranteed on top)
  const items = displayImages.map((src, i) => {
    let diff = i - activeIndex;
    if (diff > displayImages.length / 2) diff -= displayImages.length;
    if (diff < -displayImages.length / 2) diff += displayImages.length;
    return { src, i, diff };
  });

  const sortedItems = [...items].sort((a, b) => {
    const aIsCenter = a.diff === 0;
    const bIsCenter = b.diff === 0;
    if (aIsCenter && !bIsCenter) return 1;
    if (!aIsCenter && bIsCenter) return -1;
    return 0;
  });

  return (
    <motion.div
      layoutId={`card-${cleanId}`}
      className="w-full rounded-2xl overflow-hidden relative flex flex-col justify-center items-center py-5 sm:py-7 lg:py-9 border border-white/[0.08]"
      style={{ backgroundColor: '#111214', minHeight: 260 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="relative w-full h-[220px] sm:h-[300px] lg:h-[370px] overflow-hidden flex items-center justify-center pointer-events-none"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {sortedItems.map(({ src, i, diff }) => {
            const isCenter = diff === 0;
            const isLeft = diff === -1;
            const isRight = diff === 1;

            let x = 0;
            let scale = 1;
            let opacity = 0;
            let zIndex = 1;

            if (isCenter) {
              x = 0;
              scale = 1;
              opacity = 1;
              zIndex = 20;
            } else if (isLeft) {
              x = -xOffset;
              scale = 0.78;
              opacity = 0.45;
              zIndex = 2;
            } else if (isRight) {
              x = xOffset;
              scale = 0.78;
              opacity = 0.45;
              zIndex = 2;
            } else {
              x = diff < 0 ? -xOffset * 1.6 : xOffset * 1.6;
              scale = 0.65;
              opacity = 0;
              zIndex = 0;
            }

            const sizeClasses = isCenter
              ? 'w-[230px] sm:w-[350px] lg:w-[460px] h-[180px] sm:h-[265px] lg:h-[330px] px-3 sm:px-4 py-0 rounded-[12px] shadow-2xl'
              : 'w-[170px] sm:w-[260px] lg:w-[340px] h-[135px] sm:h-[200px] lg:h-[245px] px-2 sm:px-3 py-0 rounded-[12px] shadow-lg';

            return (
              <motion.div
                key={src + '-' + i}
                initial={false}
                animate={{
                  x,
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
                  zIndex,
                  pointerEvents: 'none',
                }}
              >
                <div
                  className={`flex items-end justify-center border border-black/10 shrink-0 select-none overflow-hidden transition-all duration-300 ${sizeClasses} ${isClass ? carouselBg : ''}`}
                  style={cardStyle}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-contain object-bottom rounded-[12px] pointer-events-none block"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Content Section Loading Skeleton ──────────────────────────────────────────
function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse mt-4">
      {/* Overview Card Skeleton — 100% Solid Dark Backgrounds */}
      <div className="bg-[#111214] rounded-2xl border border-white/[0.08] p-6 sm:p-8 flex flex-col gap-5">
        <div className="h-6 bg-white/[0.08] rounded-md w-36" />
        <div className="flex flex-col gap-3 pt-1">
          <div className="h-3.5 bg-white/[0.05] rounded w-full" />
          <div className="h-3.5 bg-white/[0.05] rounded w-[92%]" />
          <div className="h-3.5 bg-white/[0.05] rounded w-[84%]" />
          <div className="h-3.5 bg-white/[0.05] rounded w-[60%]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="h-20 bg-white/[0.04] rounded-xl border border-white/[0.08]" />
          <div className="h-20 bg-white/[0.04] rounded-xl border border-white/[0.08]" />
        </div>
      </div>

      {/* Detail Section Skeleton — 100% Solid Dark Backgrounds */}
      <div className="bg-[#111214] rounded-2xl border border-white/[0.08] p-6 sm:p-8 flex flex-col gap-5">
        <div className="h-6 bg-white/[0.08] rounded-md w-48" />
        <div className="flex flex-col gap-3 pt-1">
          <div className="h-3.5 bg-white/[0.05] rounded w-full" />
          <div className="h-3.5 bg-white/[0.05] rounded w-[88%]" />
          <div className="h-3.5 bg-white/[0.05] rounded w-[72%]" />
        </div>
        <div className="h-60 sm:h-72 bg-white/[0.04] rounded-xl border border-white/[0.08] w-full mt-2" />
      </div>
    </div>
  );
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────
interface ProjectSidebarProps {
  project: NotionProject | null;
  notionPageId: string;
  // Optimistic state from navigation — shown immediately before project loads
  optimisticTitle?: string;
  optimisticTags?: string[];
  optimisticDescription?: string;
  sections: ProjectSection[];
  activeSection: string;
  onNavClick: (id: string) => void;
}

function ProjectSidebar({ project, notionPageId, optimisticTitle, optimisticTags, optimisticDescription }: ProjectSidebarProps) {
  const navigate = useNavigate();
  const cleanId = notionPageId ? notionPageId.replace(/-/g, '') : '';

  const title = project?.title ?? optimisticTitle ?? '';
  const tags = project?.tags ?? optimisticTags ?? [];
  const subtext = project?.subtext ?? optimisticDescription ?? '';
  const duration = project?.duration;
  const team = project?.team;

  return (
    <aside className="w-full lg:w-[400px] shrink-0 flex flex-col lg:justify-between lg:h-screen lg:sticky top-0 lg:overflow-y-auto py-6 lg:py-10 px-4 sm:px-6 lg:px-10 border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-transparent z-10">

      {/* TOP SECTION */}
      <div className="flex flex-col gap-0">
        {/* Back icon button (w-10 h-10 on mobile, w-14 h-14 on desktop — matches homepage profile size & styling) */}
        <button
          onClick={() => navigate('/')}
          title="Back to home"
          aria-label="Back to home"
          className="mb-6 w-10 h-10 lg:w-14 lg:h-14 rounded-full border border-white/10 lg:border-[2px] lg:border-white/6 bg-white/8 hover:bg-white/15 text-white/70 hover:text-white transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer group shadow-sm select-none"
        >
          <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1" strokeWidth={2.5} />
        </button>

        {/* Project heading — matches project card title font size */}
        <div className="mt-0">
          <motion.h1
            layoutId={`card-title-${cleanId}`}
            className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight tracking-tight text-white"
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {title}
          </motion.h1>

          {/* Subtext — matches homepage subtext font, size, weight, color, leading */}
          {subtext && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
              className="text-sm sm:text-base font-medium text-white/60 leading-relaxed max-w-sm mt-3 sm:mt-4"
            >
              {subtext}
            </motion.p>
          )}

          {/* Tags — shared layoutId matches WorkCard tags div */}
          <div className="mt-4 sm:mt-5 lg:mt-6">
            <ProjectTags tags={tags} layoutId={`card-tags-${cleanId}`} />
          </div>
        </div>
      </div>

      {/* Meta fields (Duration & Team) — 2 cols on mobile, vertical stack on desktop */}
      {project && (duration || team) && (
        <div className="mt-6 lg:mt-auto pt-5 lg:pt-6 border-t border-white/[0.06] grid grid-cols-2 lg:flex lg:flex-col gap-4 lg:gap-7">
          {[
            { label: 'Duration', value: duration },
            { label: 'Team', value: team },
          ]
            .filter((m) => m.value)
            .map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1 sm:gap-1.5">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-white/60">
                  {label}
                </span>
                <span className="text-xs sm:text-sm font-medium text-white/90 leading-snug">{value}</span>
              </div>
            ))}
        </div>
      )}
    </aside>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ProjectPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollTo, lenisRef } = useSmoothScroll({ wrapperRef: contentRef });

  const normalizedPageId = getCleanPageId(pageId);
  const [project, setProject] = useState<NotionProject | null>(null);
  const [quickSections, setQuickSections] = useState<ProjectSection[]>([]);
  const [detailedSections, setDetailedSections] = useState<ProjectSection[]>([]);
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'detailed' ? 'detailed' : 'quick';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('');
  const [isFirstProject, setIsFirstProject] = useState(normalizedPageId === PROJECT_ORDER[0]);
  const [allProjects, setAllProjects] = useState<Omit<NotionProject, 'blocks' | 'updatedAt'>[]>([]);

  const currentSections = activeTab === 'quick' ? quickSections : detailedSections;

  useEffect(() => {
    if (currentSections.length > 0) {
      lenisRef.current?.resize();
    }
  }, [currentSections, lenisRef]);

  // Check if current page is the first project & fetch all projects for prev/next
  useEffect(() => {
    if (!pageId) return;
    getAllProjectsFromCache()
      .then((all) => {
        const sorted = [...all].sort((a, b) => {
          const ai = PROJECT_ORDER.indexOf(getCleanPageId(a.notionPageId));
          const bi = PROJECT_ORDER.indexOf(getCleanPageId(b.notionPageId));
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
        setAllProjects(sorted);
        if (sorted.length > 0) {
          const firstId = getCleanPageId(sorted[0].notionPageId);
          setIsFirstProject(normalizedPageId === firstId);
        }
      })
      .catch(() => { });
  }, [pageId, normalizedPageId]);

  // Reset scroll to top when page changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [pageId]);

  const forceRefresh = searchParams.get('refresh') === 'true';

  const applyBlocks = useCallback((blocks: NotionBlock[]) => {
    const { quickSections: qs, detailedSections: ds, hasQuickRead: hqr } = groupProjectBlocksIntoTabs(blocks);
    setQuickSections(qs);
    setDetailedSections(ds);
    setIsLoading(false);

    // If no URL tab query parameter is present, pick smart default:
    // If Quick Read exists, default to Quick Read; otherwise Detailed.
    const tabParam = searchParams.get('tab');
    if (tabParam === 'detailed' || tabParam === 'quick') {
      setActiveTab(tabParam);
    } else if (hqr) {
      setActiveTab('quick');
    } else {
      setActiveTab('detailed');
    }
  }, [searchParams]);

  const handleTabChange = useCallback((tab: 'quick' | 'detailed') => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true, state });
    // Reset activeSection
    const target = tab === 'quick' ? quickSections : detailedSections;
    if (target.length > 0) {
      setActiveSection(`section-${target[0].title.toLowerCase().replace(/\s+/g, '-')}`);
    } else {
      setActiveSection('');
    }
  }, [searchParams, setSearchParams, state, quickSections, detailedSections]);

  // ── Load project data (Supabase-first, Notion as fallback) ──────────────────
  useEffect(() => {
    if (!pageId) return;

    let cancelled = false;
    setError(null);
    setIsLoading(true);
    // Don't reset project — keep showing whatever we have (optimistic state)

    (async () => {
      try {
        // 1. Try Supabase cache first (fast, no proxy needed)
        const cached = await getCachedProject(pageId);
        if (cached && !cancelled) {
          setProject(cached);
          applyBlocks(cached.blocks);

          // If forceRefresh, also re-fetch from Notion in the background to update cache
          if (forceRefresh) {
            getProjectWithBlocks(pageId)
              .then((fresh) => {
                if (!cancelled) {
                  setProject(fresh);
                  applyBlocks(fresh.blocks);
                }
                upsertProject(fresh).catch(() => { });
              })
              .catch(() => { }) // silently ignore Notion errors if cache was shown
              .finally(() => {
                if (!cancelled && searchParams.has('refresh')) {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('refresh');
                  setSearchParams(newParams, { replace: true, state });
                }
              });
          }
          return;
        }

        // 2. Cache miss — fetch fresh from Notion (requires proxy)
        const data = await getProjectWithBlocks(pageId);
        if (!cancelled) {
          setProject(data);
          applyBlocks(data.blocks);
          if (searchParams.has('refresh')) {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('refresh');
            setSearchParams(newParams, { replace: true, state });
          }
        }
        upsertProject(data).catch(() => { });

      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setIsLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, forceRefresh, applyBlocks]);

  // ── Scroll-spy ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSections.length) return;
    const content = contentRef.current;
    if (!content) return;

    const sectionEls = content.querySelectorAll('[id^="section-"]');
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { root: content, rootMargin: '0px 0px -55% 0px', threshold: [0, 0.15] }
    );
    sectionEls.forEach((el) => observer.observe(el));
    return () => sectionEls.forEach((el) => observer.unobserve(el));
  }, [currentSections]);

  // ── Nav click ──────────────────────────────────────────────────────────────
  const scrollToSection = useCallback((id: string) => {
    const el = contentRef.current?.querySelector(`#${id}`);
    if (el) {
      scrollTo(el as HTMLElement);
      setActiveSection(id);
    }
  }, [scrollTo]);

  const navigate = useNavigate();

  // Find index of current project for previous / next buttons & cover image resolution
  const currentIndex = allProjects.findIndex(
    (p) => getCleanPageId(p.notionPageId) === normalizedPageId
  );

  const resolvedIdx = currentIndex >= 0 ? currentIndex : getProjectIndex(pageId);
  // Deterministic cover image mapping based on project ID and order
  const activeCoverImage =
    getCoverImageForProject(pageId, resolvedIdx) ||
    state?.coverImage ||
    COVER_IMAGES[resolvedIdx % COVER_IMAGES.length] ||
    COVER_IMAGES[0];
  const activeIndex = state?.index ?? resolvedIdx;

  // ── Error state ────────────────────────────────────────────────────────────
  if (error && !project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
        <p className="text-white/50 text-sm">Failed to load project: {error}</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-white/70 hover:text-white border border-white/20 rounded-full px-4 py-1.5 transition-colors"
        >
          ← Back home
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-transparent text-foreground antialiased relative">
      <ProjectSidebar
        project={project}
        notionPageId={pageId!}
        optimisticTitle={state?.title}
        optimisticTags={state?.tags}
        optimisticDescription={state?.description}
        sections={currentSections}
        activeSection={activeSection}
        onNavClick={scrollToSection}
      />

      {/* Scrollable right content */}
      <div ref={contentRef} className="flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="min-h-full pt-4 lg:pt-8 pb-6 lg:pb-8 relative">


          <div className="relative z-10">
            {/* Hero banner — keeps its own horizontal padding */}
            <div className="px-4 sm:px-6 lg:px-4">
              <HeroBanner
                coverImage={activeCoverImage}
                notionPageId={pageId!}
                index={activeIndex}
              />
            </div>

            {/* Mode Switcher Tabs: "Quick Read" | "Detailed" */}
            <div className="px-4 sm:px-6 lg:px-4">
              <ProjectTabs
                activeTab={activeTab}
                onChange={handleTabChange}
              />
            </div>

            {/* Content sections */}
            <div className="mt-1 px-4 sm:px-6 lg:px-4 relative">
              {/* Skeleton: fades out when sections load */}
              {isLoading && !error && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <SectionSkeleton />
                </motion.div>
              )}

              {/* Quick Read tab content */}
              {!isLoading && activeTab === 'quick' && (
                <motion.div
                  key="quick-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {quickSections.length > 0 ? (
                    quickSections.map((section, i) => (
                      <SectionContent key={`quick-${section.title}-${i}`} section={section} isFirst={i === 0} />
                    ))
                  ) : (
                    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#111214] p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 mt-4">
                      <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/60">
                        <Zap className="w-5 h-5 text-yellow-300" />
                      </div>
                      <div className="flex flex-col gap-1.5 max-w-md">
                        <h3 className="text-lg font-semibold text-white">Quick Read Coming Soon</h3>
                        {/* <p className="text-sm text-white/50 leading-relaxed">
                          To add a Quick Read for this project, add a <span className="text-white/80 font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded"># Quick Read</span> section in your Notion page.
                        </p> */}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTabChange('detailed')}
                        className="mt-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                      >
                        Read Detailed Case Study →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Detailed tab content */}
              {!isLoading && activeTab === 'detailed' && (
                <motion.div
                  key="detailed-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {detailedSections.length > 0 ? (
                    detailedSections.map((section, i) => (
                      <SectionContent key={`detailed-${section.title}-${i}`} section={section} isFirst={i === 0} />
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-24">
                      <p className="text-sm text-white/80">No content found in this Notion page yet.</p>
                    </div>
                  )}

                  {/* Twitter / X posts 2-row continuous ticker — rendered ONLY for the first article once loaded */}
                  {isFirstProject && detailedSections.length > 0 && <TwitterTickerSection />}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right side vertical tick indicator / menu popover */}
      {currentSections.length > 0 && (
        <ProjectScrollNav
          sections={currentSections}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
      )}
    </div>
  );
}

// ─── Scroll Navigation Indicator ─────────────────────────────────────────────
interface ProjectScrollNavProps {
  sections: ProjectSection[];
  activeSection: string;
  onSectionClick: (id: string) => void;
}

function ProjectScrollNav({ sections, activeSection, onSectionClick }: ProjectScrollNavProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden lg:flex fixed right-2 top-1/2 -translate-y-1/2 z-50 items-center justify-end"
      style={{ paddingRight: '8px' }}
    >
      {/* Popover menu showing section names */}
      <div
        className={`absolute right-6 bg-[#111214] border border-white/[0.08] rounded-xl p-3 flex flex-col gap-1 shadow-2xl min-w-[160px] transition-all duration-200 origin-right ${isHovered
          ? 'opacity-100 scale-100 translate-x-0'
          : 'opacity-0 scale-95 translate-x-1 pointer-events-none'
          }`}
      >
        {/* <span className="text-[10px] uppercase tracking-widest text-white/35 font-semibold px-2 pb-1 border-b border-white/5 mb-1 cursor-default">
          Table of Contents
        </span> */}
        {sections.map((s) => {
          const id = `section-${s.title.toLowerCase().replace(/\s+/g, '-')}`;
          const isActive = activeSection === id;
          return (
            <button
              key={s.title}
              onClick={() => onSectionClick(id)}
              className={`text-[11px] text-left py-1 px-2 rounded transition-colors cursor-pointer w-full leading-relaxed ${isActive
                ? 'text-white bg-white/10 font-medium'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
            >
              {s.title}
            </button>
          );
        })}
      </div>

      {/* Visual Ticks stack */}
      <div className="flex flex-col gap-2 py-4 px-2 cursor-pointer items-end">
        {sections.map((s) => {
          const id = `section-${s.title.toLowerCase().replace(/\s+/g, '-')}`;
          const isActive = activeSection === id;
          return (
            <button
              key={s.title}
              onClick={() => onSectionClick(id)}
              className="h-[6px] flex items-center focus:outline-none cursor-pointer group"
              title={s.title}
            >
              <div
                className={`h-[2px] w-5 rounded-sm transition-all duration-250 ${isActive ? 'bg-white' : 'bg-white/20 group-hover:bg-white/50'
                  }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
