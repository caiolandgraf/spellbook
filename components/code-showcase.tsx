"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const codeSnippets = [
  {
    lang: "JavaScript",
    code: `function sumArray(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}`,
    color: "#f0db4f",
  },
  {
    lang: "Python",
    code: `def fibonacci(n):\n    return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)`,
    color: "#3776ab",
  },
  {
    lang: "TypeScript",
    code: `interface User {\n  name: string;\n  email: string;\n}`,
    color: "#3178c6",
  },
];

export function CodeShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % codeSnippets.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = codeSnippets[currentIndex];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Code Editor Window */}
        <div className="rounded-xl border border-border/50 overflow-hidden backdrop-blur-sm bg-card/30">
          {/* Window Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 text-center">
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${current.color}20`,
                  color: current.color,
                }}
              >
                {current.lang}
              </span>
            </div>
            <div className="w-16" />
          </div>

          {/* Code Content */}
          <div className="p-6 font-mono text-sm">
            <pre className="text-foreground/90 whitespace-pre-wrap">
              {current.code}
            </pre>
          </div>
        </div>

        {/* Glow Effect */}
        <div
          className="absolute -inset-1 rounded-xl blur-xl opacity-30 -z-10"
          style={{ backgroundColor: current.color }}
        />
      </motion.div>
    </div>
  );
}
