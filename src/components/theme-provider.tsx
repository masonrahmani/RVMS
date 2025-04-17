"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps extends React.PropsWithChildren {}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <NextThemesProvider>{children}</NextThemesProvider>;
}
