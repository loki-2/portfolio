import type { WorkItem } from './types';

export const PROJECT_ORDER = [
  '3804078ba2908056aeacdb709e4bffe7', // Redesigning a Prediction Exchange for Scale
  '3804078ba29080cfab17ff8f582002ba', // Building a Sports Prediction Exchange 0→1
  '3734078ba290801484dadc9ff0a8c51b', // Designing for Human-AI Collaboration
];

export const COVER_IMAGES = [
  '/cover_fintech.png',
  '/cover_ai_chat.png',
  '/cover_spotify.png',
];

export const PROJECT_COVERS: Record<string, string> = {
  '3804078ba2908056aeacdb709e4bffe7': '/cover_fintech.png',
  '3804078ba29080cfab17ff8f582002ba': '/cover_ai_chat.png',
  '3734078ba290801484dadc9ff0a8c51b': '/cover_spotify.png',
};

export const PROJECT_CAROUSELS: Record<string, string[]> = {
  '3804078ba2908056aeacdb709e4bffe7': ['/cas1/1.png', '/cas1/2.png', '/cas1/3.png', '/cas1/4.png'],
  '3804078ba29080cfab17ff8f582002ba': ['/cas2/1.png', '/cas2/2.png', '/cas2/3.png'],
  '3734078ba290801484dadc9ff0a8c51b': ['/cas3/1.png', '/cas3/2.png', '/cas3/3.png'],
};

export const PROJECT_CAROUSEL_BGS: Record<string, string> = {
  '3804078ba2908056aeacdb709e4bffe7': '#fafaf1ff',
  '3804078ba29080cfab17ff8f582002ba': '#f9fff6ff',
  '3734078ba290801484dadc9ff0a8c51b': '#fafaf1ff',
};

export const DEFAULT_WORK_ITEMS: WorkItem[] = [
  {
    title: 'Redesigning a Prediction Exchange for Scale and Growth',
    description: 'How we reimagined navigation, discovery, as a sports prediction platform expanded beyond its MVP and initial users.',
    tags: ['WEB3', 'B2C', 'RESPONSIVE'],
    coverImage: '/cover_fintech.png',
    carouselImages: ['/cas1/1.png', '/cas1/2.png', '/cas1/3.png', '/cas1/4.png'],
    carouselBg: '#fafaf1ff',
    notionPageId: '3804078ba2908056aeacdb709e4bffe7',
  },
  {
    title: 'Building a Sports Prediction Exchange 0→1',
    description: 'Designing the MVP for Pred, a high-frequency sports trading platform built on Solana.',
    tags: ['WEB3', 'B2C', 'MOBILE'],
    coverImage: '/cover_ai_chat.png',
    carouselImages: ['/cas2/1.png', '/cas2/2.png', '/cas2/3.png'],
    carouselBg: '#f9fff6ff',
    notionPageId: '3804078ba29080cfab17ff8f582002ba',
  },
  {
    title: 'Designing for Human-AI Collaboration',
    description: 'Rethinking IDE interactions for AI-assisted development workflows at Dashwave.',
    tags: ['AI', 'SAAS', 'B2B'],
    coverImage: '/cover_spotify.png',
    carouselImages: ['/cas3/1.png', '/cas3/2.png', '/cas3/3.png'],
    carouselBg: '#eefbffff',
    notionPageId: '3734078ba290801484dadc9ff0a8c51b',
  },
];

export function getCarouselImagesForProject(id?: string): string[] {
  if (id) {
    const clean = getCleanPageId(id);
    if (PROJECT_CAROUSELS[clean]) return PROJECT_CAROUSELS[clean];
  }
  return ['/cas1/1.png', '/cas1/2.png', '/cas1/3.png', '/cas1/4.png'];
}

export function getCarouselBgForProject(id?: string, index?: number): string {
  if (id) {
    const clean = getCleanPageId(id);
    if (PROJECT_CAROUSEL_BGS[clean]) return PROJECT_CAROUSEL_BGS[clean];
  }
  if (index === 0) return '#feffe9ff';
  return 'bg-white';
}

export function getCleanPageId(id?: string): string {
  return id ? id.replace(/-/g, '') : '';
}

export function getCoverImageForProject(id?: string, index?: number): string {
  if (id) {
    const clean = getCleanPageId(id);
    if (PROJECT_COVERS[clean]) return PROJECT_COVERS[clean];
    const orderIdx = PROJECT_ORDER.indexOf(clean);
    if (orderIdx !== -1 && COVER_IMAGES[orderIdx]) return COVER_IMAGES[orderIdx];
  }
  if (typeof index === 'number' && index >= 0 && COVER_IMAGES[index % COVER_IMAGES.length]) {
    return COVER_IMAGES[index % COVER_IMAGES.length];
  }
  return COVER_IMAGES[0];
}

export function getProjectIndex(id?: string): number {
  if (!id) return 0;
  const clean = getCleanPageId(id);
  const idx = PROJECT_ORDER.indexOf(clean);
  return idx >= 0 ? idx : 0;
}
