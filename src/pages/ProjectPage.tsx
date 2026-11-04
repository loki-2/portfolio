import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ProjectTags } from '@/components/ProjectTag';
import { getCachedProject, upsertProject, getAllProjectsFromCache } from '@/lib/supabase';
import { getProjectWithBlocks } from '@/lib/notion';
import { SectionContent, groupBlocksIntoSections } from '@/components/NotionRenderer';
import type { NotionProject, ProjectSection } from '@/lib/types';
import { TwitterTickerSection } from '@/components/TwitterTicker';
import {
  PROJECT_ORDER,
  COVER_IMAGES,
  getCoverImageForProject,
  getProjectIndex,
  getCleanPageId,
} from '@/lib/projects';
import { useSmoothScroll } from '@/lib/useSmoothScroll';

// ─── Hero banner ──────────────────────────────────────────────────────────────
function HeroBanner({
  coverImage,
  notionPageId,
}: {
  coverImage?: string;
  notionPageId: string;
  index?: number;
}) {
  const cleanId = notionPageId ? notionPageId.replace(/-/g, '') : '';

  return (
    <motion.div
      layoutId={`card-${cleanId}`}
      className="w-full rounded-xl overflow-hidden relative flex flex-col justify-end items-center"
      style={{ minHeight: 200, backgroundColor: '#111214' }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Cover image */}
      {coverImage && (
        <div className="w-full pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-10 flex items-end justify-center relative">
          <motion.img
            layoutId={`card-image-${cleanId}`}
            src={coverImage}
            alt=""
            className="w-full h-auto max-h-[380px] lg:max-h-[440px] object-cover object-left-top rounded-none block -mb-2"
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}
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
    <aside className="w-full lg:w-[400px] shrink-0 flex flex-col lg:justify-between lg:h-screen lg:sticky top-0 lg:overflow-y-auto py-6 lg:py-10 px-5 lg:px-10 border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-transparent z-10">

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
            className="text-2xl lg:text-3xl font-semibold leading-tight tracking-tight text-white"
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {title}
          </motion.h1>

          {/* Subtext — matches homepage subtext font, size, weight, color, leading, mt-4 */}
          {subtext && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
              className="text-base font-medium text-white/60 leading-relaxed max-w-sm mt-4"
            >
              {subtext}
            </motion.p>
          )}

          {/* Tags — shared layoutId matches WorkCard tags div */}
          <div className="mt-5 lg:mt-6">
            <ProjectTags tags={tags} layoutId={`card-tags-${cleanId}`} />
          </div>
        </div>
      </div>

      {/* Meta fields (Duration & Team) — 2 rows (label on top, value below) with increased gap */}
      {project && (duration || team) && (
        <div className="mt-8 lg:mt-auto pt-6 border-t border-white/[0.06] flex flex-col gap-6 lg:gap-7">
          {[
            { label: 'Duration', value: duration },
            { label: 'Team', value: team },
          ]
            .filter((m) => m.value)
            .map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-white/60">
                  {label}
                </span>
                <span className="text-sm font-medium text-white/90 leading-snug">{value}</span>
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
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('');
  const [isFirstProject, setIsFirstProject] = useState(normalizedPageId === PROJECT_ORDER[0]);
  const [allProjects, setAllProjects] = useState<Omit<NotionProject, 'blocks' | 'updatedAt'>[]>([]);

  useEffect(() => {
    if (sections.length > 0) {
      lenisRef.current?.resize();
    }
  }, [sections, lenisRef]);

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

  // ── Load project data (Supabase-first, Notion as fallback) ──────────────────
  useEffect(() => {
    if (!pageId) return;

    let cancelled = false;
    setError(null);
    // Don't reset project — keep showing whatever we have (optimistic state)

    (async () => {
      try {
        // 1. Try Supabase cache first (fast, no proxy needed)
        const cached = await getCachedProject(pageId);
        if (cached && !cancelled) {
          setProject(cached);
          setSections(groupBlocksIntoSections(cached.blocks));

          // If forceRefresh, also re-fetch from Notion in the background to update cache
          if (forceRefresh) {
            getProjectWithBlocks(pageId)
              .then((fresh) => {
                if (!cancelled) {
                  setProject(fresh);
                  setSections(groupBlocksIntoSections(fresh.blocks));
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
          setSections(groupBlocksIntoSections(data.blocks));
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
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, forceRefresh]);

  // ── Scroll-spy ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sections.length) return;
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
  }, [sections]);

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
        sections={sections}
        activeSection={activeSection}
        onNavClick={scrollToSection}
      />

      {/* Scrollable right content */}
      <div ref={contentRef} className="flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="min-h-full pt-4 lg:pt-8 pb-6 lg:pb-8 relative">


          <div className="relative z-10">
            {/* Hero banner — keeps its own horizontal padding */}
            <div className="px-4 lg:px-4">
              <HeroBanner
                coverImage={activeCoverImage}
                notionPageId={pageId!}
                index={activeIndex}
              />
            </div>

            {/* Notion content sections — crossfade skeleton → content without layout shift */}
            <div className="mt-1 px-4 relative">
              {/* Skeleton: fades out when sections load */}
              {sections.length === 0 && !error && (
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

              {/* Content: fades in when sections load */}
              {sections.length > 0 && (
                <motion.div
                  key="loaded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {project && sections.map((section, i) => (
                    <SectionContent key={section.title} section={section} isFirst={i === 0} />
                  ))}
                </motion.div>
              )}

              {/* Twitter / X posts 2-row continuous ticker — rendered ONLY for the first article once loaded */}
              {isFirstProject && sections.length > 0 && <TwitterTickerSection />}

              {project && sections.length === 0 && (
                <div className="flex items-center justify-center py-24">
                  <p className="text-sm text-white/80">No content found in this Notion page yet.</p>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>

      {/* Right side vertical tick indicator / menu popover */}
      {sections.length > 0 && (
        <ProjectScrollNav
          sections={sections}
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
