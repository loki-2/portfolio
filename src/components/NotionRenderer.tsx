import React from 'react';
import type { NotionBlock, NotionRichText, ProjectSection } from '@/lib/types';

// ─── Rich-text renderer ───────────────────────────────────────────────────────
function RichText({ items }: { items: NotionRichText[] }) {
  return (
    <>
      {(items ?? []).map((span, i) => {
        let node: React.ReactNode = span.plain_text;
        if (span.annotations.bold) node = <strong key={i}>{node}</strong>;
        if (span.annotations.italic) node = <em key={i}>{node}</em>;
        if (span.annotations.code) node = <code key={i} className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono">{node}</code>;
        if (span.annotations.strikethrough) node = <s key={i}>{node}</s>;
        if (span.annotations.underline) node = <u key={i}>{node}</u>;
        if (span.href) node = <a key={i} href={span.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white transition-colors">{node}</a>;
        return <React.Fragment key={i}>{node}</React.Fragment>;
      })}
    </>
  );
}

// ─── Auto-playing continuous video component ───────────────────────────────
function AutoPlayVideo({ src, caption }: { src: string; caption: NotionRichText[] }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play().catch(() => { });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <figure className="my-8 -mx-4 lg:-mx-6 flex flex-col items-center">
      <div className="w-full rounded-[0px] bg-white p-6 sm:p-8 lg:p-12 shadow-2xl flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-auto max-w-full h-auto max-h-[75vh] rounded-[20px] block mx-auto object-contain"
        />
      </div>
      {caption.length > 0 && (
        <figcaption className="text-center text-xs text-white/40 mt-3">
          <RichText items={caption} />
        </figcaption>
      )}
    </figure>
  );
}

// Common text wrapper class for indents
const TEXT_WRAPPER = "max-w-[92%] sm:max-w-[85%] lg:max-w-[70%] mx-auto w-full";

// ─── Individual block types ───────────────────────────────────────────────────
function BlockRenderer({ block }: { block: NotionBlock }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b = block as any;

  switch (block.type) {
    case 'paragraph':
      if (!b.paragraph?.rich_text?.length) return <div className="h-3" />;
      return (
        <p className={`text-[1.1rem] font-medium text-white/72 leading-[32px] mb-4 ${TEXT_WRAPPER}`}>
          <RichText items={b.paragraph.rich_text} />
        </p>
      );

    case 'heading_1':
      return (
        <h1 className={`text-[2rem] leading-relaxed font-semibold text-white mt-6 mb-2 ${TEXT_WRAPPER}`}>
          <RichText items={b.heading_1?.rich_text ?? []} />
        </h1>
      );

    case 'heading_2':
      return (
        <h2 className={`text-[1.8rem] font-semibold text-white mt-6 mb-2 ${TEXT_WRAPPER}`}>
          <RichText items={b.heading_2?.rich_text ?? []} />
        </h2>
      );

    case 'heading_3':
      return (
        <h3 className={`text-[1.4rem] font-semibold text-white mt-10 mb-2 tracking-tight ${TEXT_WRAPPER}`}>
          <RichText items={b.heading_3?.rich_text ?? []} />
        </h3>
      );

    case 'bulleted_list_item':
      return (
        <li className="flex gap-2 text-[1.1rem] text-white/90 leading-relaxed mb-1.5">
          <span className="mt-3 mr-2 w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
          <span><RichText items={b.bulleted_list_item?.rich_text ?? []} /></span>
        </li>
      );

    case 'numbered_list_item':
      return (
        <li className="text-[1.1rem] text-white/90 leading-relaxed mb-1.5 list-decimal list-inside">
          <RichText items={b.numbered_list_item?.rich_text ?? []} />
        </li>
      );

    case 'quote':
      return (
        <blockquote className={`border-l-2 border-white/20 pl-4 py-1 my-8 text-[1.5rem] text-white/90 italic leading-relaxed ${TEXT_WRAPPER}`}>
          <RichText items={b.quote?.rich_text ?? []} />
        </blockquote>
      );

    case 'callout': {
      const emoji = b.callout?.icon?.emoji ?? '💡';
      return (
        <div className={`flex gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 my-4 ${TEXT_WRAPPER}`}>
          <span className="text-lg leading-relaxed shrink-0">{emoji}</span>
          <p className="text-[0.9rem] text-white/60 leading-relaxed">
            <RichText items={b.callout?.rich_text ?? []} />
          </p>
        </div>
      );
    }

    case 'image': {
      const src = b.image?.file?.url ?? b.image?.external?.url ?? '';
      const caption = b.image?.caption ?? [];
      return (
        <figure className="my-6 -mx-4 lg:-mx-6">
          <img src={src} alt={caption.map((c: NotionRichText) => c.plain_text).join('')} className="w-full rounded-[0px] object-cover" />
          {caption.length > 0 && (
            <figcaption className="text-center text-xs text-white/30 mt-2">
              <RichText items={caption} />
            </figcaption>
          )}
        </figure>
      );
    }

    case 'divider':
      return <hr className={`border-white/[0.07] my-6 ${TEXT_WRAPPER}`} />;

    case 'code':
      return (
        <pre className={`bg-white/[0.04] border border-white/[0.07] rounded-xl px-5 py-4 my-4 overflow-x-auto ${TEXT_WRAPPER}`}>
          <code className="text-xs text-white/70 font-mono leading-relaxed">
            <RichText items={b.code?.rich_text ?? []} />
          </code>
        </pre>
      );

    case 'video':
    case 'embed':
    case 'bookmark':
    case 'tweet': {
      const payload = b.video ?? b.embed ?? b.bookmark ?? b.tweet ?? {};
      const rawUrl = payload.file?.url ?? payload.external?.url ?? payload.url ?? '';
      const caption = payload.caption ?? [];

      if (!rawUrl) return null;

      // Helper to check if URL is a direct video file
      const isDirectVideo =
        /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(rawUrl) ||
        rawUrl.includes('prod-files-secure.s3') ||
        rawUrl.includes('supabase.co/storage') ||
        b.type === 'video';

      // Helper to turn common links (Twitter, YouTube, Loom, Vimeo) into iframe embeds
      const getEmbedUrl = (url: string) => {
        // Twitter / X
        const tweetMatch = url.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/([0-9]+)/);
        if (tweetMatch) {
          return `https://platform.twitter.com/embed/Tweet.html?id=${tweetMatch[1]}&theme=dark&hideThread=true`;
        }

        // YouTube
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&controls=0&playlist=${ytMatch[1]}`;

        // Loom
        const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/);
        if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1&hide_owner=true`;

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&background=1`;

        return url;
      };

      const embedUrl = getEmbedUrl(rawUrl);
      const isTwitterEmbed = embedUrl.includes('platform.twitter.com/embed/Tweet.html');
      const isIframe = embedUrl !== rawUrl || !isDirectVideo;

      if (!isIframe) {
        return <AutoPlayVideo src={rawUrl} caption={caption} />;
      }

      // If Twitter embed, render compact Twitter card container
      if (isTwitterEmbed) {
        return (
          <figure className="my-8 mx-auto w-full max-w-lg flex flex-col items-center">
            <div className="w-full h-[220px] rounded-xl overflow-hidden bg-[#161616] border border-white/10 shadow-2xl">
              <iframe
                src={embedUrl}
                title="Embedded Tweet"
                className="w-full h-full border-0"
                scrolling="no"
              />
            </div>
            {caption.length > 0 && (
              <figcaption className="text-center text-xs text-white/40 mt-3">
                <RichText items={caption} />
              </figcaption>
            )}
          </figure>
        );
      }

      return (
        <figure className="my-8 -mx-4 lg:-mx-6 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-black/50 border border-white/10 shadow-2xl">
            <iframe
              src={embedUrl}
              title="Embedded Media"
              className="absolute inset-0 w-full h-full border-0 rounded-[16px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          {caption.length > 0 && (
            <figcaption className="text-center text-xs text-white/40 mt-3">
              <RichText items={caption} />
            </figcaption>
          )}
        </figure>
      );
    }

    default:
      return null;
  }
}

// ─── List grouper (wraps consecutive list items in ul/ol) ────────────────────
function renderBlocksGrouped(blocks: NotionBlock[]): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let bulletBuffer: NotionBlock[] = [];
  let numberedBuffer: NotionBlock[] = [];

  const flushBullets = () => {
    if (!bulletBuffer.length) return;
    nodes.push(
      <ul key={`ul-${bulletBuffer[0].id}`} className={`mb-4 ${TEXT_WRAPPER}`}>
        {bulletBuffer.map((b) => <BlockRenderer key={b.id} block={b} />)}
      </ul>
    );
    bulletBuffer = [];
  };
  const flushNumbered = () => {
    if (!numberedBuffer.length) return;
    nodes.push(
      <ol key={`ol-${numberedBuffer[0].id}`} className={`mb-4 ${TEXT_WRAPPER}`}>
        {numberedBuffer.map((b) => <BlockRenderer key={b.id} block={b} />)}
      </ol>
    );
    numberedBuffer = [];
  };

  for (const block of blocks) {
    if (block.type === 'bulleted_list_item') {
      flushNumbered();
      bulletBuffer.push(block);
    } else if (block.type === 'numbered_list_item') {
      flushBullets();
      numberedBuffer.push(block);
    } else {
      flushBullets();
      flushNumbered();
      nodes.push(<BlockRenderer key={block.id} block={block} />);
    }
  }
  flushBullets();
  flushNumbered();
  return nodes;
}

// ─── Section renderer (used by ProjectPage) ───────────────────────────────────
export function SectionContent({ section, isFirst }: { section: ProjectSection; isFirst: boolean }) {
  return (
    <div
      id={`section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
      className={`w-full ${isFirst ? 'mt-4 lg:mt-6' : 'mt-4 lg:mt-6'}`}
    >
      <div
        className="w-full px-4 lg:px-6 py-8 lg:py-12"
        style={{ background: '#131313', borderRadius: 12 }}
      >
        <div className="w-full flex flex-col gap-4">
          <h2 className={`text-2xl lg:text-3xl font-semibold text-white tracking-tight ${TEXT_WRAPPER}`}>{section.title}</h2>
          <div>{renderBlocksGrouped(section.blocks)}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Exported block grouper ───────────────────────────────────────────────────
export function groupBlocksIntoSections(blocks: NotionBlock[]): ProjectSection[] {
  const sections: ProjectSection[] = [];
  let current: ProjectSection | null = null;

  for (const block of blocks) {
    if (block.type === 'heading_1') {
      if (current) sections.push(current);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rt = (block as any).heading_1?.rich_text ?? [];
      current = { title: rt.map((r: NotionRichText) => r.plain_text).join(''), blocks: [] };
    } else if (current) {
      current.blocks.push(block);
    }
  }
  if (current) sections.push(current);
  return sections;
}
