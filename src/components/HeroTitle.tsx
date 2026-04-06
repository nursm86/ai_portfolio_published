"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const titles = ["Full-Stack Developer", "AI Enthusiast", "Problem Solver"];

export default function HeroTitle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((p) => (p + 1) % titles.length),
      2500
    );
    return () => clearInterval(id);
  }, []);

return (
  <div className="relative overflow-hidden">
    <AnimatePresence mode="wait">
      <motion.h1
        key={titles[index]}
        className="inline-block leading-tight text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl"
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        exit={{ y: "-100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {titles[index]}
      </motion.h1>
    </AnimatePresence>
  </div>
);

}
