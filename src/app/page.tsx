'use client';

import FluidCursor from '@/components/FluidCursor';
import { Button } from '@/components/ui/button';
import { GithubButton } from '@/components/ui/github-button';
import WelcomeModal from '@/components/welcome-modal';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Car,
  Cloud,
  Globe,
  Laugh,
  Layers,
  Moon,
  Sparkles,
  Sun,
  UserRoundSearch,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import HeroTitle from "@/components/HeroTitle";


/* ---------- current activities ---------- */
const currentActivities = [
  { label: "Preparing for AWS Solutions Architect Associate exam", icon: Cloud, color: "#F59E0B" },
  { label: "Building globalpsychicsassociation.com platform", icon: Globe, color: "#3B82F6" },
  { label: "Working with open source AI models", icon: Sparkles, color: "#A855F7" },
  { label: "V2V Negotiation research for autonomous vehicles at WSU", icon: Car, color: "#10B981" },
];

/* ---------- quick-question data ---------- */
const questions = {
  Me: "Who are you? I want to know more about you.",
  Projects: "What are your projects? What are you working on right now?",
  Skills: "What are your skills? Give me a list of your soft and hard skills.",
  Contact: "How can I contact you?",
} as const;

const questionConfig: { key: keyof typeof questions; color: string; icon: typeof Laugh }[] = [
  { key: "Me", color: "#329696", icon: Laugh },
  { key: "Projects", color: "#3E9858", icon: BriefcaseBusiness },
  { key: "Skills", color: "#856ED9", icon: Layers },
  { key: "Contact", color: "#C19433", icon: UserRoundSearch },
];

/* ---------- component ---------- */
export default function Home() {
  const [input, setInput] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const goToChat = (query: string) =>
    router.push(`/chat?query=${encodeURIComponent(query)}`);

  /* hero animations (unchanged) */
  const topElementVariants = {
    hidden: { opacity: 0, y: -60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'tween' as const, duration: 0.8 },
    },
  };
  const bottomElementVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'tween' as const, duration: 0.8, delay: 0.2 },
    },
  };

  useEffect(() => {
    // Preload chat avatar image
    const img = new window.Image();
    img.src = '/landing-memojis.png';
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* big blurred footer word */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
        <div
          className="hidden bg-gradient-to-b from-neutral-500/10 to-neutral-500/0 bg-clip-text text-[10rem] leading-none font-black text-transparent select-none sm:block lg:text-[16rem]"
          style={{ marginBottom: '-2.5rem' }}
        >
          Nur Islam
        </div>
      </div>

      {/* Top-right buttons */}
      <div className="absolute top-6 right-8 z-20 flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white/30 shadow-md backdrop-blur-lg transition hover:bg-white/60 dark:border-white/50 dark:hover:bg-neutral-800"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 dark:text-white" />
        </button>
        <GithubButton
          //targetStars={68}
          animationDuration={1.5}
          label="Star"
          size={'sm'}
          repoUrl="https://github.com/nursm86/ai_portfolio_published"
        />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => goToChat('Are you looking for an internship?')}
          className="relative flex cursor-pointer items-center gap-2 rounded-full border bg-white/30 px-4 py-1.5 text-sm font-medium text-black shadow-md backdrop-blur-lg transition hover:bg-white/60 dark:border-white dark:text-white dark:hover:bg-neutral-800"
        >
          {/* Green pulse dot */}
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          Looking for a talent?
        </button>
      </div>

      {/* header */}
      <motion.div
        className="z-1 mt-16 mb-4 flex flex-col items-center text-center md:mt-4 md:mb-6"
        variants={topElementVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="z-100">
          <WelcomeModal />
        </div>

        <h2 className="text-secondary-foreground mt-1 text-xl font-semibold md:text-2xl">
          Hey, I'm Nur 👋
        </h2>
        <HeroTitle />
      </motion.div>

      {/* centre memoji */}
      <div className="relative z-10 h-48 w-44 overflow-hidden sm:h-64 sm:w-60">
        <Image
          src="/landing-memojis.png"
          alt="Hero memoji"
          width={2000}
          height={2000}
          priority
          className="translate-y-14 scale-[2] object-cover"
        />
      </div>

      {/* currently up to */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'tween', duration: 0.6, delay: 0.4 }}
        className="z-10 mt-2 w-full max-w-2xl px-2"
      >
        <p className="mb-2 text-center text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          What I&#39;m up to
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
          {currentActivities.map(({ label, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="flex min-w-[160px] max-w-[200px] shrink-0 items-center gap-2.5 rounded-xl border border-neutral-200 bg-white/30 px-3 py-2.5 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-800/50"
            >
              <Icon size={16} strokeWidth={2} color={color} className="shrink-0" />
              <span className="text-[11px] leading-tight font-medium text-neutral-700 dark:text-neutral-300">
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* input + quick buttons */}
      <motion.div
        variants={bottomElementVariants}
        initial="hidden"
        animate="visible"
        className="z-10 mt-4 flex w-full flex-col items-center justify-center md:px-0"
      >
        {/* free-form question */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) goToChat(input.trim());
          }}
          className="relative w-full max-w-lg"
        >
          <div className="mx-auto flex items-center rounded-full border border-neutral-200 bg-white/30 py-2.5 pr-2 pl-6 backdrop-blur-lg transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="w-full border-none bg-transparent text-base text-neutral-800 placeholder:text-neutral-500 focus:outline-none dark:text-neutral-200 dark:placeholder:text-neutral-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Submit question"
              className="flex items-center justify-center rounded-full bg-[#0171E3] p-2.5 text-white transition-colors hover:bg-blue-600 disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <ArrowRight  className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* quick-question grid */}
        <div className="mt-4 flex w-full max-w-2xl justify-center gap-3">
          {questionConfig.map(({ key, color, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => goToChat(questions[key])}
              variant="outline"
              className="border-border hover:bg-border/30 aspect-square w-24 cursor-pointer rounded-2xl border bg-white/30 py-8 shadow-none backdrop-blur-lg active:scale-95 dark:bg-neutral-800/50 dark:border-neutral-700 dark:hover:bg-neutral-700/50 md:w-28 md:p-10"
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-700 dark:text-gray-300">
                <Icon size={22} strokeWidth={2} color={color} />
                <span className="text-xs font-medium sm:text-sm">{key}</span>
              </div>
            </Button>
          ))}
        </div>
      </motion.div>
      <FluidCursor />
    </div>
  );
}
