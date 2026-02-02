"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </StoreProvider>
  );
}
