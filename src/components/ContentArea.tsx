import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { WorkItem, NotionProject } from '@/lib/types';
import { getAllProjectsFromCache } from '@/lib/supabase';
import { Button } from './ui/button';

// ─── Per-card cover images (index-based until Notion has a Cover property) ────
const COVER_IMAGES = [
  '/cover_fintech.png',
  '/cover_ai_chat.png',
  '/cover_spotify.png',
];

// ─── Deterministic background colours per card index ─────────────────────────
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

// ─── Fixed display order of Notion page IDs ───────────────────────────────────
// This ensures cover images/gradients stay consistent regardless of Supabase order.
const PROJECT_ORDER = [
  '3804078ba2908056aeacdb709e4bffe7', // Redesigning a Prediction Exchange for Scale
  '3804078ba29080cfab17ff8f582002ba', // Building a Sports Prediction Exchange 0→1
  '3734078ba290801484dadc9ff0a8c51b', // Designing for Human-AI Collaboration
];

function projectToWorkItem(
  p: Omit<NotionProject, 'blocks' | 'updatedAt'>,
  index: number
): WorkItem {
  return {
    title: p.title,
    description: p.subtext,
    tags: p.tags,
    bgClass: BG_CLASSES[index % BG_CLASSES.length],
    bgGradient: BG_GRADIENTS[index],
    coverImage: COVER_IMAGES[index] ?? COVER_IMAGES[0],
    notionPageId: p.notionPageId,
  };
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function WorkCardSkeleton() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden flex flex-col lg:flex-row items-stretch bg-white/[0.03] animate-pulse h-auto lg:h-[480px]">
      <div className="flex flex-col justify-end p-6 sm:p-7 lg:p-9 flex-1 gap-4">
        <div className="h-6 w-3/4 bg-white/[0.07] rounded-lg" />
        <div className="h-4 w-1/2 bg-white/[0.05] rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-white/[0.05] rounded-full" />
          <div className="h-5 w-20 bg-white/[0.05] rounded-full" />
        </div>
      </div>
      <div className="w-full lg:w-[42%] h-52 lg:h-auto bg-white/[0.02]" />
    </div>
  );
}

const WorkCard: React.FC<WorkItem> = ({ title, tags, bgClass, bgGradient, coverImage, notionPageId }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/project/${notionPageId}`, { state: { bgClass, bgGradient, coverImage } })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/project/${notionPageId}`, { state: { bgClass, bgGradient, coverImage } })}
      className={`relative w-full rounded-xl overflow-hidden cursor-pointer group transition-transform duration-200 hover:scale-[1.005] active:scale-[0.998] flex flex-col lg:flex-row lg:items-stretch lg:h-[480px] ${bgClass}`}
      style={{ ...(bgGradient ? { background: bgGradient } : {}) }}
    >
      {/* Row 1 on mobile / Left text on desktop */}
      <div className="flex flex-col justify-between p-6 sm:p-7 lg:p-9 w-full lg:w-[45%] shrink-0 z-10">
        {/* Top: title + tags */}
        <div className="flex flex-col gap-4 lg:gap-6">
          <h3 className="text-2xl lg:text-3xl font-semibold text-white leading-tight max-w-xs pt-2 lg:pt-4">
            {title}
          </h3>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 lg:gap-3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[11px] lg:text-[11px] uppercase tracking-widest font-semibold border-white/30 text-white rounded-[4px] px-2 py-1 lg:px-2 lg:py-3 bg-transparent"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: read more */}
        <div className="flex items-center line-height-[16px] gap-1 text-[15px] lg:text-[16px] text-white/80 font-medium group-hover:gap-2 transition-all duration-200 mt-6 lg:mt-0">
          Read more
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>

      {/* Row 2 on mobile / Right cover image on desktop */}
      {coverImage && (
        <div className="px-5 sm:px-6 pb-0 lg:px-0 lg:pb-0 relative w-full lg:w-auto lg:flex-1 shrink-0 overflow-hidden lg:ml-auto">
          <div className="relative w-full lg:h-[480px]">
            <img
              src={coverImage}
              alt=""
              className="w-full h-auto object-contain object-top rounded-none block -mb-2 lg:mb-0 lg:absolute lg:inset-x-0 lg:top-12 lg:w-full lg:h-[calc(100%-32px)] lg:object-cover lg:object-left-top z-[1]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Static project card (not from Notion/DB) ───────────────────────────────
interface StaticWorkItem {
  title: string;
  tags: string[];
  coverImage?: string;
  href: string;
  bgClass?: string;
  bgGradient?: string;
}

const StaticWorkCard: React.FC<StaticWorkItem> = ({ title, tags, coverImage, href, bgClass = 'bg-[#1a2520]', bgGradient }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative w-full rounded-xl overflow-hidden cursor-pointer group transition-transform duration-200 hover:scale-[1.005] active:scale-[0.998] no-underline flex flex-col ${bgClass
        }`}
      style={{ ...(bgGradient ? { background: bgGradient } : {}) }}
    >
      {/* Row 1: text (title + tags + read more) */}
      <div className="flex flex-col justify-between p-6 sm:p-7 lg:p-9 z-10">
        {/* Title + tags */}
        <div className="flex flex-col gap-4 lg:gap-6">
          <h3 className="text-xl lg:text-2xl font-semibold text-white leading-tight max-w-xs">
            {title}
          </h3>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 lg:gap-3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] uppercase tracking-widest font-semibold border-white/30 text-white rounded-[4px] px-2 py-1 lg:py-3 bg-transparent"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Read more — identical to WorkCard */}
        <div className="flex items-center gap-1 text-[15px] lg:text-[16px] text-white/80 font-medium group-hover:gap-2 transition-all duration-200 mt-6">
          Read more
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>

      {/* Row 2: cover image — touches bottom on mobile, original desktop layout */}
      {coverImage && (
        <div className="px-5 sm:px-6 pb-0 lg:px-6 lg:pb-0">
          <div className="relative w-full shrink-0 overflow-hidden lg:h-72">
            <img
              src={coverImage}
              alt=""
              className="w-full h-auto object-contain object-top block -mb-2 lg:mb-0 lg:absolute lg:inset-0 lg:w-full lg:h-full lg:object-cover lg:object-left-top"
            />
          </div>
        </div>
      )}
    </a>
  );
};

// ─── Static projects list (edit title / tags / image / href here) ─────────────
const STATIC_PROJECTS: StaticWorkItem[] = [
  {
    title: 'Spotify vibes - Elevating listeners experience',
    tags: ['Mobile', 'Concept'],
    coverImage: '/spotify.png',   // swap out with your own image
    href: 'https://medium.com/design-bootcamp/introducing-spotify-vibes-a-new-feature-to-elevate-the-listeners-experience-19286d87d1ef',
    bgGradient: 'radial-gradient(ellipse at center, #1dd65eff 0%, #06a340ff 100%)',
  },
  {
    title: 'Improving User Activation on Dashwave',
    tags: ['SaaS', 'B2B'],
    coverImage: '/dashwave.png',   // swap out with your own image
    href: 'https://medium.com/@abhishek.edla1203/dashwave-1-0-8730d5f50183',
    bgGradient: 'radial-gradient(ellipse at center, #1685C5 0%, #105C89 100%)',
  },
];

interface iTunesTrack {
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackViewUrl: string;
}

const MinimalMusicPlayer: React.FC = () => {
  const [track, setTrack] = useState<iTunesTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('https://itunes.apple.com/lookup?id=1407165118')
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results[0]) {
          setTrack(data.results[0]);
        }
      })
      .catch((err) => console.error('Error fetching track:', err));
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !track) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error(e));
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track]);

  if (!track) {
    return (
      <div className="w-full bg-[#131313] border border-white/5 rounded-xl p-4 flex items-center justify-between animate-pulse" style={{ height: '78px' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/5 rounded-lg" />
          <div className="flex flex-col gap-1">
            <div className="w-20 h-3 bg-white/5 rounded" />
            <div className="w-12 h-2 bg-white/5 rounded" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5" />
      </div>
    );
  }

  const highResArtwork = track.artworkUrl100.replace('100x100bb.jpg', '200x200bb.jpg');

  return (
    <div className="w-full bg-[#131313] border border-white/[0.06] rounded-xl p-4 flex flex-col relative overflow-hidden group">
      <audio ref={audioRef} src={track.previewUrl} preload="auto" />

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* CD Cover Art */}
          <div className="w-12 h-12 rounded-full relative shadow shrink-0 group-hover:scale-[1.03] transition-transform duration-300">
            {/* Spinning CD disc */}
            <div
              className="w-full h-full rounded-full overflow-hidden relative border border-white/10"
              style={{
                animation: isPlaying ? 'spin 8s linear infinite' : 'none',
              }}
            >
              <img src={highResArtwork} alt={track.trackName} className="w-full h-full object-cover" />
              {/* CD sheen reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-white/5 to-black/25" />
            </div>

            {/* CD Center Hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#131313] border border-white/20 rounded-full z-20 shadow-inner" />

            {/* Small playing indicator on top of CD */}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center z-10 pointer-events-none">
                <div className="flex items-end gap-0.5 h-2.5">
                  <div className="bg-white animate-bar-1" style={{ width: '1.5px' }} />
                  <div className="bg-white animate-bar-2" style={{ width: '1.5px' }} />
                  <div className="bg-white animate-bar-3" style={{ width: '1.5px' }} />
                </div>
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate leading-tight pr-2">{track.trackName}</h4>
            <p className="text-xs text-white/40 truncate leading-normal">{track.artistName}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            {isPlaying ? <Pause size={13} fill="black" /> : <Play size={13} fill="black" className="ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Sleek progress bar at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/[0.02]">
        <div
          className="h-full bg-white/70 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ─── Content Area ─────────────────────────────────────────────────────────────
export const ContentArea: React.FC = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllProjectsFromCache()
      .then((projects) => {
        if (!cancelled) {
          // Sort by the fixed display order so cover images/gradients always match
          const sorted = [...projects].sort((a, b) => {
            const ai = PROJECT_ORDER.indexOf(a.notionPageId);
            const bi = PROJECT_ORDER.indexOf(b.notionPageId);
            // Unknown IDs go to the end
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          });
          setWorkItems(sorted.map(projectToWorkItem));
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <main className="flex-1 pb-4 pt-4 lg:pt-8 px-4 lg:px-6 flex flex-col gap-5 lg:gap-6">

      {/* WORK SECTION */}
      <section id="work" className="scroll-mt-10 flex flex-col gap-5 lg:gap-6">
        {loading && (
          <>
            <WorkCardSkeleton />
            <WorkCardSkeleton />
            <WorkCardSkeleton />
          </>
        )}
        {error && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-white/40">Couldn't load projects: {error}</p>
          </div>
        )}
        {!loading && !error && workItems.map((item) => (
          <WorkCard key={item.notionPageId} {...item} />
        ))}

        {/* ── Static projects (2-col on desktop, 1-col on mobile) ── */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
            {STATIC_PROJECTS.map((item) => (
              <StaticWorkCard key={item.href} {...item} />
            ))}
          </div>
        )}
      </section>



      {/* EXPERIENCE SECTION */}
      <section id="experience" className="scroll-mt-10">
        <div className="bg-[#131313] rounded-xl p-6 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Left: Title & Resume */}
          <div className="w-full lg:w-[33%] flex flex-col justify-between gap-8 lg:gap-12 shrink-0">
            <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">Experience</h2>

            <div className="bg-white/5 rounded-2xl p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-medium text-white">Abhishek Edla</h4>
                <p className="text-[10px] text-white/40 tracking-wide">PRODUCT DESIGNER | INDIA</p>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-white pt-2 border-t border-white/10 cursor-pointer group">
                View resume
                <div className="bg-white text-black p-1 rounded-full group-hover:scale-110 transition-transform">
                  <ArrowRight size={12} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Experience List */}
          <div className="w-full lg:w-[72%] flex flex-col gap-3">

            {/* Experience rows */}
            {[
              {
                role: 'Founding Product Designer',
                company: 'Pred - Web3',
                period: '2025 ~ present',
                image: '/pred.png',
              },
              {
                role: 'Founding Product Designer',
                company: 'Dashwave - AI SaaS',
                period: '2024 ~ 2025',
                image: '/dashwavelogo.png',
              },
              {
                role: 'Design Intern',
                company: 'Dashwave, Wyshlist, K12',
                period: '2022 ~ 2024',
                image: '/other.png',
              }
            ].map(({ role, company, period, image }) => (
              <div key={company} className="bg-white/[0.04] rounded-2xl p-4 lg:p-5 flex items-center gap-5 transition-colors">
                <div className="w-12 h-12 shrink-0 overflow-hidden rounded-[12px] bg-white/[0.04] border-2 border-white/10 flex items-center justify-center">
                  <img src={image} alt={company} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <h4 className="text-base font-medium text-white">{role}</h4>
                  <p className="text-sm text-white/50">{company}</p>
                </div>
                <div className="text-sm text-white/40 shrink-0 font-medium tracking-wide">
                  {period}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* HOW I USE AI SECTION */}
      <section id="ai" className="scroll-mt-10">
        <div className="bg-[#131313] rounded-xl p-6 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Left: Title */}
          <div className="w-full lg:w-[33%] flex flex-col gap-4 shrink-0">
            <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">How I use AI</h2>
            <p className="text-sm text-white/40 leading-relaxed pr-4">
              A look at how AI fits into my daily workflow—from prototypes to production.
            </p>
          </div>

          {/* Right: AI Use Cases */}
          <div className="w-full lg:w-[72%] flex flex-col gap-8 lg:gap-10 lg:pt-2">

            <div className="flex gap-5 lg:gap-6 pb-8 lg:pb-10 border-b border-white/5">
              <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 overflow-hidden rounded-[14px] bg-white/[0.04] border-2 border-white/10 flex items-center justify-center">
                <img src="/claudecode.png" alt="Claude Code" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium text-white">Shipping production UI faster</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  I use Claude Code to implement UI fixes, polish motion interactions, and ship to production in case of less tech bandwidth.
                </p>
              </div>
            </div>

            <div className="flex gap-5 lg:gap-6 pb-8 lg:pb-10 border-b border-white/5">
              <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 overflow-hidden rounded-[14px] bg-white/[0.04] border-2 border-white/10 flex items-center justify-center">
                <img src="/antigravity.png" alt="Antigravity" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium text-white">Building full-stack personal projects</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  I use Antigravity to build my personal projects end-to-end. It's become my playground for experimenting, shipping, and learning through real products.
                </p>
                <a
                  href="https://getvibecoderz.com/profile/9079433c-7a5c-4dc0-a688-f8eb12712bd7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white underline underline-offset-4 transition-colors w-fit pt-1 group"
                >
                  View my projects
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            <div className="flex gap-5 lg:gap-6 pb-8 lg:pb-10 border-b border-white/5">
              <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 overflow-hidden rounded-[14px] bg-white/[0.04] border-2 border-white/10 flex items-center justify-center">
                <img src="/cursor.png" alt="Cursor" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium text-white">Turning design ideas into interactive prototypes</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  I use Cursor to build realistic prototypes that stakeholders can interact with, making feedback faster and product decisions more informed.
                </p>
              </div>
            </div>

            <div className="flex gap-5 lg:gap-6 border-white/5">
              <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 overflow-hidden rounded-[14px] bg-white/[0.04] border-2 border-white/10 flex items-center justify-center">
                <img src="/gemini.png" alt="Gemini" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium text-white">Creating product visual assets</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  I use Gemini to generate product graphics, illustrations, and 3D icons faster which would otherwise.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="scroll-mt-10">
        <div className="bg-[#131313] rounded-xl p-6 lg:p-12 flex flex-col gap-8 lg:gap-10">
          <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">About</h2>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Left: Image & Links */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 shrink-0">
              <div className="aspect-[4/5] bg-white/5 rounded-2xl overflow-hidden relative">
                <img src="/me.png" alt="Abhishek" className="w-full h-full object-cover" />
              </div>

              {/* Music embed */}
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-[11px] uppercase tracking-widest text-white/30 font-medium px-1">Vibing to</span>
                <MinimalMusicPlayer />
              </div>
            </div>

            {/* Right: Text List */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6 lg:pt-2 lg:pr-6">
              <div className="flex flex-col gap-2 pb-8 lg:pb-10 border-b border-white/5 pr-4">
                <h3 className="text-xl font-medium text-white">Shipping beyond work</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  I enjoy turning ideas into products, launching personal projects  and learning by building.
                </p>
              </div>

              <div className="flex flex-col gap-2 pb-8 lg:pb-10 border-b border-white/5 pr-4">
                <h3 className="text-xl font-medium text-white">Writing in public</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  I share my learnings on LinkedIn about product design, AI, startups, and the lessons I pick up while building.
                </p>
              </div>

              <div className="flex flex-col gap-2 pb-8 lg:pb-10 pr-4">
                <h3 className="text-xl font-medium text-white">Life outside design</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  When I'm not designing, you'll usually find me playing football or listening to music.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="mb-6">
        <div className="w-full rounded-xl p-6 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 relative overflow-hidden bg-gradient-to-br from-[#0F3F2D] to-[#0A261B]">
          <h2 className="text-3xl lg:text-4xl font-semibold text-white leading-tight tracking-tight max-w-xl z-10">
            Need an designer who takes ownership? I'd love to be your guy.
          </h2>

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
        </div>
      </section>
    </main>
  );
};
