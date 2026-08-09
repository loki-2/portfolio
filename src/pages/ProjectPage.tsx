import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { getCachedProject, upsertProject, getAllProjectsFromCache } from '@/lib/supabase';
import { getProjectWithBlocks } from '@/lib/notion';
import { SectionContent, groupBlocksIntoSections } from '@/components/NotionRenderer';
import type { NotionProject, ProjectSection } from '@/lib/types';
import { TwitterTickerSection } from '@/components/TwitterTicker';

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse bg-white/[0.07] rounded-lg ${className}`} style={style} />;
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-10 w-full">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-16 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

// Matches the palette in ContentArea so banner bg == card bg
const BANNER_BG_CLASSES = [
  '#1a3a1a', '#0f2535', '#1a1a2e', '#2a1a1a', '#251a2e', '#1a2520',
];
const BANNER_GRADIENTS: Record<number, string> = {
  2: 'radial-gradient(ellipse at center, #1685C5 0%, #105C89 100%)',
};
function cardIndexFromId(id: string): number {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return hash % BANNER_BG_CLASSES.length;
}

// ─── Hero banner ──────────────────────────────────────────────────────────────
function HeroBanner({
  bgClass,
  bgGradient,
  coverImage,
  notionPageId
}: {
  bgClass?: string;
  bgGradient?: string;
  coverImage?: string;
  notionPageId: string;
}) {
  // Fallback to deterministic colour if no state was passed (e.g. deep link)
  const fallbackIdx = cardIndexFromId(notionPageId);
  const fallbackBg = BANNER_GRADIENTS[fallbackIdx] ?? `radial-gradient(ellipse at 60% 50%, ${BANNER_BG_CLASSES[fallbackIdx]} 0%, #0a0a0a 80%)`;

  const inlineStyle = bgGradient ? { background: bgGradient } : (!bgClass ? { background: fallbackBg } : {});
  const containerClass = `w-full rounded-xl overflow-hidden relative flex flex-col justify-end items-center ${bgClass || ''}`;

  return (
    <div className={containerClass} style={{ minHeight: 200, ...inlineStyle }}>
      {/* Cover image area — full width at bottom with 0 bottom padding */}
      {coverImage && (
        <div className="w-full pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-10 flex items-end justify-center">
          <img
            src={coverImage}
            alt=""
            className="w-full h-auto max-h-[380px] lg:max-h-[440px] object-cover object-left-top rounded-none z-[1] block -mb-2"
          />
        </div>
      )}
    </div>
  );
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────
interface ProjectSidebarProps {
  project: NotionProject;
  sections: ProjectSection[];
  activeSection: string;
  onNavClick: (id: string) => void;
}

function ProjectSidebar({ project }: ProjectSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="w-full lg:w-[400px] shrink-0 flex flex-col lg:h-screen lg:sticky top-0 lg:overflow-y-auto py-6 lg:py-10 px-5 lg:px-10 border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-background z-10">

      {/* Back button + title block — stays at the top */}
      <div className="flex flex-col gap-5 lg:gap-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm w-fit group bg-white/10 rounded-full p-1 cursor-pointer"
        >
          <svg className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Project title block */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-2xl lg:text-[1.6rem] font-semibold text-white leading-snug tracking-tight">
            {project.title}
          </h1>

          {project.subtext && (
            <p className="text-sm lg:text-md text-white/60 leading-relaxed">{project.subtext}</p>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] uppercase tracking-widest font-semibold border-white/20 text-white/50 rounded-full px-2.5 py-0.5 bg-transparent"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section nav + meta — pinned to the bottom */}
      <div className="mt-6 lg:mt-auto flex flex-col">
        {/* Section nav (desktop only) — 32px above meta fields */}
        {/* {sections.length > 0 && (
          <nav className="hidden lg:flex flex-col gap-1 mb-8">
            {sections.map((s) => {
              const id = `section-${s.title.toLowerCase().replace(/\s+/g, '-')}`;
              const isActive = activeSection === id;
              return (
                <button
                  key={s.title}
                  onClick={() => onNavClick(id)}
                  className={`flex items-center gap-2.5 text-sm text-left w-fit py-0.5 transition-colors focus:outline-none ${isActive ? 'text-white' : 'text-white/30 hover:text-white/60'
                    }`}
                >
                  {s.title}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />}
                </button>
              );
            })}
          </nav>
        )} */}

        {/* Meta fields */}
        <div className="flex flex-col gap-3">
          {[
            { label: 'Duration', value: project.duration },
            // { label: 'Role', value: project.role },
            { label: 'Team', value: project.team },
            // { label: 'Methods', value: project.methods },
          ]
            .filter((m) => m.value)
            .map(({ label, value }) => (
              <div key={label} className="flex items-baseline gap-3">
                <span className="text-[11px] uppercase tracking-widest text-white/25 w-16 shrink-0">
                  {label}
                </span>
                <span className="text-sm text-white/60">{value}</span>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
}

const COVER_IMAGES = [
  '/cover_fintech.png',
  '/cover_ai_chat.png',
  '/cover_spotify.png',
];

const BG_CLASSES = [
  'bg-[#1a3a1a]',
  'bg-[#0f2535]',
  'bg-[#1a1a2e]',
  'bg-[#2a1a1a]',
  'bg-[#251a2e]',
  'bg-[#1a2520]',
];

const BG_GRADIENTS: Record<number, string> = {
  0: 'radial-gradient(ellipse at center, #e7e734ff 0%, #86800bff 100%)',
  1: 'radial-gradient(ellipse at center, #70d13cff 0%, #468226ff 100%)',
  2: 'radial-gradient(ellipse at center, #1685C5 0%, #105C89 100%)',
};

// ─── Main page ────────────────────────────────────────────────────────────────
export function ProjectPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  const [project, setProject] = useState<NotionProject | null>(null);
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('');
  const [isFirstProject, setIsFirstProject] = useState(false);
  const [allProjects, setAllProjects] = useState<Omit<NotionProject, 'blocks' | 'updatedAt'>[]>([]);

  // Check if current page is the first project & fetch all projects for prev/next
  useEffect(() => {
    if (!pageId) return;
    getAllProjectsFromCache()
      .then((all) => {
        // Sort by same fixed order used on homepage
        const PROJECT_ORDER = [
          '3804078ba2908056aeacdb709e4bffe7',
          '3804078ba29080cfab17ff8f582002ba',
          '3734078ba290801484dadc9ff0a8c51b',
        ];
        const sorted = [...all].sort((a, b) => {
          const ai = PROJECT_ORDER.indexOf(a.notionPageId);
          const bi = PROJECT_ORDER.indexOf(b.notionPageId);
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
        setAllProjects(sorted);
        if (sorted.length > 0) {
          const currentId = pageId.replace(/-/g, '');
          const firstId = sorted[0].notionPageId.replace(/-/g, '');
          setIsFirstProject(currentId === firstId);
        }
      })
      .catch(() => { });
  }, [pageId]);

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
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1. Try Supabase cache first (fast, no proxy needed)
        const cached = await getCachedProject(pageId);
        if (cached && !cancelled) {
          setProject(cached);
          setSections(groupBlocksIntoSections(cached.blocks));
          setLoading(false);

          // If forceRefresh, also re-fetch from Notion in the background to update cache
          if (forceRefresh) {
            getProjectWithBlocks(pageId)
              .then((fresh) => {
                if (!cancelled) {
                  setProject(fresh);
                  setSections(groupBlocksIntoSections(fresh.blocks));
                }
                upsertProject(fresh).catch(() => {});
              })
              .catch(() => {}) // silently ignore Notion errors if cache was shown
              .finally(() => {
                if (!cancelled) setSearchParams({}, { replace: true });
              });
          }
          return;
        }

        // 2. Cache miss — fetch fresh from Notion (requires proxy)
        const data = await getProjectWithBlocks(pageId);
        if (!cancelled) {
          setProject(data);
          setSections(groupBlocksIntoSections(data.blocks));
          setLoading(false);
          setSearchParams({}, { replace: true });
        }
        upsertProject(data).catch(() => {});

      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
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
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  }, []);

  const navigate = useNavigate();

  // Find index of current project for previous / next buttons & cover image resolution
  const normalizedPageId = pageId ? pageId.replace(/-/g, '') : '';
  const currentIndex = allProjects.findIndex(
    (p) => p.notionPageId.replace(/-/g, '') === normalizedPageId
  );
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : null;

  const fallbackIdx = project ? cardIndexFromId(project.notionPageId) : 0;
  const resolvedIdx = currentIndex >= 0 ? currentIndex : fallbackIdx;
  const activeBgClass = state?.bgClass ?? BG_CLASSES[resolvedIdx % BG_CLASSES.length];
  const activeBgGradient = state?.bgGradient ?? BG_GRADIENTS[resolvedIdx];
  const activeCoverImage = state?.coverImage ?? COVER_IMAGES[resolvedIdx % COVER_IMAGES.length] ?? COVER_IMAGES[0];

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
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

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading || !project) {
    return (
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background">
        <div className="w-full lg:w-[400px] border-r border-white/[0.06]">
          <SidebarSkeleton />
        </div>
        <div className="flex-1 p-10 flex flex-col gap-5">
          <Skeleton className="w-full rounded-2xl" style={{ height: 340 } as React.CSSProperties} />
          <Skeleton className="h-5 w-1/3 mt-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-[#0D0D0D] text-foreground antialiased relative">
      <ProjectSidebar
        project={project}
        sections={sections}
        activeSection={activeSection}
        onNavClick={scrollToSection}
      />

      {/* Scrollable right content */}
      <div ref={contentRef} className="flex-1 lg:h-screen lg:overflow-y-auto pt-4 lg:pt-8 pb-6 lg:pb-8">

        {/* Hero banner — keeps its own horizontal padding */}
        <div className="px-4 lg:px-4">
          <HeroBanner
            notionPageId={project.notionPageId}
            bgClass={activeBgClass}
            bgGradient={activeBgGradient}
            coverImage={activeCoverImage}
          />
        </div>

        {/* Notion content sections — 48px side margins */}
        <div className="mt-1 px-4">
          {sections.map((section, i) => (
            <SectionContent key={section.title} section={section} isFirst={i === 0} />
          ))}

          {/* Twitter / X posts 2-row continuous ticker — rendered ONLY for the first article */}
          {isFirstProject && <TwitterTickerSection />}

          {sections.length === 0 && (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm text-white/80">No content found in this Notion page yet.</p>
            </div>
          )}

          {/* Prev / Next Project Navigation Cards */}
          {(prevProject || nextProject) && (
            <div className="mt-8 sm:mt-14 mb-8 pt-6 sm:pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row gap-4 justify-between items-stretch">
              {/* Previous Project Card */}
              {prevProject ? (
                <button
                  onClick={() => {
                    const prevIdx = currentIndex - 1;
                    navigate(`/project/${prevProject.notionPageId}`, {
                      state: {
                        bgClass: BG_CLASSES[prevIdx % BG_CLASSES.length],
                        bgGradient: BG_GRADIENTS[prevIdx],
                        coverImage: COVER_IMAGES[prevIdx] ?? COVER_IMAGES[0],
                      },
                    });
                  }}
                  className="flex-1 flex flex-col gap-1.5 p-4 sm:p-5 rounded-xl bg-[#131313] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-white/40 font-medium group-hover:text-white/70 transition-colors">
                    <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span>Previous Project</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-white transition-colors line-clamp-1">
                    {prevProject.title}
                  </h4>
                </button>
              ) : (
                <div className="flex-1 hidden sm:block" />
              )}

              {/* Next Project Card */}
              {nextProject ? (
                <button
                  onClick={() => {
                    const nextIdx = currentIndex + 1;
                    navigate(`/project/${nextProject.notionPageId}`, {
                      state: {
                        bgClass: BG_CLASSES[nextIdx % BG_CLASSES.length],
                        bgGradient: BG_GRADIENTS[nextIdx],
                        coverImage: COVER_IMAGES[nextIdx] ?? COVER_IMAGES[0],
                      },
                    });
                  }}
                  className="flex-1 flex flex-col gap-1.5 items-end p-4 sm:p-5 rounded-xl bg-[#131313] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] transition-all text-right group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-white/40 font-medium group-hover:text-white/70 transition-colors">
                    <span>Next Project</span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-white transition-colors line-clamp-1">
                    {nextProject.title}
                  </h4>
                </button>
              ) : (
                <div className="flex-1 hidden sm:block" />
              )}
            </div>
          )}
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
        className={`absolute right-6 bg-[#131313] border border-white/[0.08] rounded-xl p-3 flex flex-col gap-1 shadow-2xl min-w-[160px] transition-all duration-200 origin-right ${isHovered
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
