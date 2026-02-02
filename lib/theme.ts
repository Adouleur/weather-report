"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
  typography: {
    fontFamily: [
      "var(--font-geist-sans)",
      "system-ui",
      "sans-serif",
    ].join(","),
  },
});
