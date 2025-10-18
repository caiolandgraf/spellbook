"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./toast-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SessionProvider>
        {children}
        <ToastProvider />
      </SessionProvider>
    </ThemeProvider>
  );
}
