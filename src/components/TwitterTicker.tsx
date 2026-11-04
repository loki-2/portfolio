
import { motion } from 'framer-motion';

export interface TweetItem {
  id: string;
  embedUrl?: string; // Can be a platform.twitter.com embed link or x.com status link
  url?: string;
  name?: string;
  handle?: string;
  avatar?: string;
  text?: string;
  date?: string;
}

export const DUMMY_TWEETS_ROW1: TweetItem[] = [
  {
    id: '1',
    embedUrl: 'https://x.com/thenarrator/status/2059321822949109989?s=20',
    url: 'https://x.com/thenarrator/status/2059321822949109989',
    name: 'The Narrator',
    handle: 'thenarrator',
  },
  {
    id: '2',
    embedUrl: 'https://x.com/Web3_CryptoGen/status/2059466792322380145?s=20',
    url: 'https://x.com/Web3_CryptoGen/status/2059466792322380145',
    name: 'Web3 CryptoGen',
    handle: 'Web3_CryptoGen',
  },
  {
    id: '3',
    embedUrl: 'https://x.com/LitCollective_/status/2059271880989696063?s=20',
    url: 'https://x.com/LitCollective_/status/2059271880989696063',
    name: 'Lit Collective',
    handle: 'LitCollective_',
  },
  {
    id: '4',
    embedUrl: 'https://x.com/bigse7en02/status/2059296196695343215?s=20',
    url: 'https://x.com/bigse7en02/status/2059296196695343215',
    name: 'Big Se7en',
    handle: 'bigse7en02',
  },
];

export const DUMMY_TWEETS_ROW2: TweetItem[] = [
  {
    id: '5',
    embedUrl: 'https://x.com/OPD_01/status/2059276204847353861?s=20',
    url: 'https://x.com/OPD_01/status/2059276204847353861',
    name: 'OPD',
    handle: 'OPD_01',
  },
  {
    id: '6',
    embedUrl: 'https://x.com/0xForecaster/status/2059274551834403005?s=20',
    url: 'https://x.com/0xForecaster/status/2059274551834403005',
    name: '0xForecaster',
    handle: '0xForecaster',
  },
  {
    id: '7',
    embedUrl: 'https://x.com/Mapemaofweb3/status/2059374618327085189?s=20',
    url: 'https://x.com/Mapemaofweb3/status/2059374618327085189',
    name: 'Mapema Web3',
    handle: 'Mapemaofweb3',
  },
  {
    id: '8',
    embedUrl: 'https://x.com/SportsOrbitX/status/2059308031167656150?s=20',
    url: 'https://x.com/SportsOrbitX/status/2059308031167656150',
    name: 'Sports Orbit X',
    handle: 'SportsOrbitX',
  },
];

function getTwitterEmbedSrc(tweet: TweetItem): string | null {
  const target = tweet.embedUrl || tweet.url;
  if (!target) return null;

  if (target.includes('platform.twitter.com/embed/Tweet.html')) {
    return target.includes('hideThread') || target.includes('hide_thread')
      ? target
      : `${target}&hideThread=true`;
  }

  const match = target.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/([0-9]+)/);
  if (match) {
    return `https://platform.twitter.com/embed/Tweet.html?id=${match[1]}&theme=dark&hideThread=true`;
  }

  return target;
}

function TweetCard({ tweet }: { tweet: TweetItem }) {
  const embedSrc = getTwitterEmbedSrc(tweet);

  if (embedSrc) {
    return (
      <div className="w-[280px] sm:w-[330px] h-[200px] shrink-0 bg-black rounded-lg overflow-hidden shadow-lg transition-all">
        <iframe
          src={embedSrc}
          title={`Tweet by ${tweet.name || 'user'}`}
          className="w-full h-full border-0 pointer-events-auto bg-black"
          style={{ filter: 'contrast(135%) brightness(72%)' }}
          scrolling="no"
        />
      </div>
    );
  }

  return (
    <a
      href={tweet.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="w-[320px] sm:w-[360px] shrink-0 bg-[#18191c] hover:bg-[#202227] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col justify-between gap-3 transition-all duration-200 group no-underline text-left"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {tweet.avatar && (
            <img
              src={tweet.avatar}
              alt={tweet.name || ''}
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10"
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate leading-tight group-hover:text-white">
              {tweet.name}
            </span>
            <span className="text-xs text-white/40 truncate leading-tight">
              @{tweet.handle}
            </span>
          </div>
        </div>

        <svg
          className="w-4 h-4 fill-white/40 group-hover:fill-white/80 transition-colors shrink-0"
          viewBox="0 0 24 24"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>

      <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal line-clamp-3">
        {tweet.text}
      </p>

      <span className="text-[11px] text-white/35 font-medium">
        {tweet.date}
      </span>
    </a>
  );
}


export function TwitterTickerSection({
  title = 'And they loved it!',
  row1 = DUMMY_TWEETS_ROW1,
  row2 = DUMMY_TWEETS_ROW2,
}: {
  title?: string;
  row1?: TweetItem[];
  row2?: TweetItem[];
}) {
  // Duplicate arrays to create continuous infinite loop
  const list1 = [...row1, ...row1, ...row1, ...row1];
  const list2 = [...row2, ...row2, ...row2, ...row2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="w-full mt-6 rounded-[12px] bg-[#111214] py-10 overflow-hidden flex flex-col gap-6"
    >
      {/* Section title */}
      <div className="px-6 lg:px-10 flex items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          {title}
        </h3>
        <span className="text-xs text-white/35 font-medium">
          Twitter / X Mentions
        </span>
      </div>

      {/* Ticker rows container */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Leftward continuous ticker */}
        <div className="flex overflow-hidden group">
          <div className="animate-marquee-left flex gap-4 pr-4 shrink-0">
            {list1.map((t, idx) => (
              <TweetCard key={`r1-${t.id}-${idx}`} tweet={t} />
            ))}
          </div>
        </div>

        {/* Row 2: Rightward continuous ticker */}
        <div className="flex overflow-hidden group">
          <div className="animate-marquee-right flex gap-4 pr-4 shrink-0">
            {list2.map((t, idx) => (
              <TweetCard key={`r2-${t.id}-${idx}`} tweet={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Telegram image preview */}
      <div className="px-6 lg:px-10 mt-2">
        <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/30">
          <img
            src="/telegram.png"
            alt="Telegram preview"
            className="w-full h-auto object-contain block"
          />
        </div>
      </div>
    </motion.div>
  );
}
