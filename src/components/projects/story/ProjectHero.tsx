'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useRef } from 'react';

type Props = {
  title: string;
  tagline: string;
  category: string;
  date: string;
  coverImage: string | null;
};

export default function ProjectHero({
  title,
  tagline,
  category,
  date,
  coverImage,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[90vh] w-full items-end overflow-hidden bg-neutral-950"
    >
      {coverImage && (
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src={coverImage}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        </motion.div>
      )}

      {/* Back-to-chat link, top-left */}
      <Link
        href="/chat"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md transition-all hover:bg-black/50 hover:text-white md:top-8 md:left-8"
      >
        <ArrowLeft size={14} />
        Back to chat
      </Link>

      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 md:pb-28"
      >
        <div className="mb-4 flex items-center gap-3 text-xs tracking-widest text-white/60 uppercase md:text-sm">
          <span>{category}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
        <h1 className="mb-6 text-4xl leading-[1.05] font-semibold tracking-tight text-white md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-white/80 md:text-2xl">
          {tagline}
        </p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-12 inline-flex items-center gap-2 text-xs text-white/50"
        >
          <ChevronDown size={14} />
          Scroll to explore
        </motion.div>
      </motion.div>
    </section>
  );
}
