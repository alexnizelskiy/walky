"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHRASES = [
  "Встречаюсь с друзьями",
  "Уехал в путешествие",
  "Работаю до ночи",
  "Иду на свидание",
];

export function HeroRotator() {
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % PHRASES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <h1 className="mx-auto max-w-4xl text-center text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
      <span className="block h-[1.15em] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ y: "60%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-60%", opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {PHRASES[i]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="block text-brand-500">и питомец не скучает</span>
    </h1>
  );
}
