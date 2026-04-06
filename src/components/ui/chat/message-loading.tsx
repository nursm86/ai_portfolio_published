"use client";

import { motion } from "framer-motion";

const dotVariants = {
  initial: { y: 0, opacity: 0.4 },
  animate: (i: number) => ({
    y: [0, -6, 0],
    opacity: [0.4, 1, 0.4],
    transition: {
      y: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 0.8,
        delay: i * 0.15,
        ease: [0.33, 0.66, 0.66, 1],
      },
      opacity: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 0.8,
        delay: i * 0.15,
        ease: "easeInOut",
      },
    },
  }),
};

export default function MessageLoading() {
  return (
    <div className="flex items-center gap-3">
      {/* "Thinking" label with shimmer */}
      <motion.span
        className="text-xs font-medium tracking-wide text-muted-foreground select-none"
        style={{
          background:
            "linear-gradient(90deg, var(--color-muted-foreground) 0%, var(--color-muted-foreground) 40%, var(--color-foreground) 50%, var(--color-muted-foreground) 60%, var(--color-muted-foreground) 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        Thinking
      </motion.span>

      {/* Animated dots */}
      <div className="flex items-center gap-[5px]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-[5px] w-[5px] rounded-full bg-muted-foreground"
            variants={dotVariants}
            initial="initial"
            animate="animate"
            custom={i}
          />
        ))}
      </div>
    </div>
  );
}
