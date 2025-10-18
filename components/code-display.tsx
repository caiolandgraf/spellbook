"use client";

import { useEffect, useRef, useState } from "react";

interface CodeDisplayProps {
  code: string;
  language: string;
  className?: string;
}

const languageMap: Record<string, string> = {
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  python: "python",
  py: "python",
  java: "java",
  csharp: "csharp",
  "c#": "csharp",
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  ruby: "ruby",
  rb: "ruby",
  go: "go",
  rust: "rust",
  rs: "rust",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  kt: "kotlin",
  sql: "sql",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  markdown: "markdown",
  md: "markdown",
};

export function CodeDisplay({ code, language, className = "" }: CodeDisplayProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !codeRef.current) return;

    const loadPrism = async () => {
      try {
        const Prism = (await import("prismjs")).default;
        
        // Load language components dynamically
        const prismLanguage = languageMap[language.toLowerCase()] || "javascript";
        
        if (prismLanguage !== "javascript") {
          try {
            await import(`prismjs/components/prism-${prismLanguage}`);
          } catch (e) {
            console.warn(`Could not load Prism language: ${prismLanguage}`);
          }
        }

        if (codeRef.current) {
          Prism.highlightElement(codeRef.current);
        }
      } catch (error) {
        console.error("Failed to load Prism:", error);
      }
    };

    loadPrism();
  }, [code, language, mounted]);

  const prismLanguage = languageMap[language.toLowerCase()] || "javascript";

  if (!mounted) {
    return (
      <pre className={`language-${prismLanguage} ${className}`}>
        <code className={`language-${prismLanguage}`}>
          {code}
        </code>
      </pre>
    );
  }

  return (
    <pre className={`language-${prismLanguage} ${className}`}>
      <code ref={codeRef} className={`language-${prismLanguage}`}>
        {code}
      </code>
    </pre>
  );
}
