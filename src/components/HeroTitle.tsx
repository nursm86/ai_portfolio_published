'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const FALLBACK_TITLES = ['Full-Stack Developer', 'AI Enthusiast', 'Problem Solver'];

type HeroTitleProps = {
  titles?: string[];
};

export default function HeroTitle({ titles }: HeroTitleProps) {
  const effectiveTitles = titles && titles.length > 0 ? titles : FALLBACK_TITLES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((p) => (p + 1) % effectiveTitles.length),
      2500,
    );
    return () => clearInterval(id);
  }, [effectiveTitles.length]);

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.h1
          key={effectiveTitles[index]}
          className="inline-block leading-tight text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {effectiveTitles[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
