"use client";

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      defaultTheme="dark"
      forcedTheme={typeof window === "undefined" ? "dark" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
