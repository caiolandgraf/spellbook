import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a human-readable string
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date to a relative time string
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}

/**
 * Get a color for a programming language
 * @param language - Programming language name
 * @returns Hex color code
 */
export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    javascript: "#f7df1e",
    typescript: "#3178c6",
    python: "#3776ab",
    java: "#007396",
    csharp: "#239120",
    cpp: "#00599c",
    c: "#555555",
    ruby: "#cc342d",
    go: "#00add8",
    rust: "#dea584",
    php: "#777bb4",
    swift: "#fa7343",
    kotlin: "#7f52ff",
    scala: "#dc322f",
    html: "#e34c26",
    css: "#1572b6",
    sql: "#e38c00",
    shell: "#89e051",
    bash: "#4eaa25",
    powershell: "#012456",
    r: "#276dc3",
    matlab: "#e16737",
    lua: "#000080",
    perl: "#39457e",
    haskell: "#5e5086",
    elixir: "#6e4a7e",
    dart: "#0175c2",
    vue: "#42b883",
    react: "#61dafb",
    angular: "#dd0031",
    svelte: "#ff3e00",
    json: "#000000",
    yaml: "#cb171e",
    markdown: "#083fa1",
    xml: "#0060ac",
    default: "#6b7280",
  };

  const key = language.toLowerCase().replace(/\s+/g, "");
  return colors[key] || colors.default;
}
