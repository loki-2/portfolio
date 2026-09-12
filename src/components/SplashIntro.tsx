import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashIntroProps {
  /** Called when the splash has fully exited and the main layout should appear */
  onComplete: () => void;
}

/**
 * Full-screen intro overlay:
 *  1. Screen is black
 *  2. Avatar drops from above-centre, tiny → grows to resting size
 *  3. "Hey! I'm Abhishek." rises up below the avatar
 *  4. The whole overlay slides left off-screen → revealing the real layout behind it
 */
export function SplashIntro({ onComplete }: SplashIntroProps) {
  const [showHeading, setShowHeading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // t=0     → avatar drops in  (animation itself handles timing)
    // t=900ms → heading fades+rises in
    const t1 = setTimeout(() => setShowHeading(true), 900);
    // t=1800ms → start sliding the overlay to the left
    const t2 = setTimeout(() => setExiting(true), 1800);
    // t=2600ms → overlay fully gone; surface the real layout
    const t3 = setTimeout(() => {
      setGone(true);
      onComplete();
    }, 2600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  return (
    <motion.div
      /* slide the whole overlay to the left when exiting */
      animate={exiting ? { x: '-100%' } : { x: 0 }}
      transition={exiting
        ? { duration: 0.75, ease: 'easeInOut' }
        : { duration: 0 }
      }
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 bg-background"
    >
      {/* Avatar — drops from above, starts tiny */}
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.25 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/25 shadow-2xl"
      >
        <img
          src="/avatar.png"
          alt="Abhishek"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Heading — fades + rises in after avatar lands */}
      <AnimatePresence>
        {showHeading && (
          <motion.h1
            key="splash-heading"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="text-3xl lg:text-5xl font-semibold text-white tracking-tight text-center px-4"
          >
            Hey! I'm Abhishek.
          </motion.h1>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
