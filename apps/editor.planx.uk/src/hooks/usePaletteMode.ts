import type { PaletteMode } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { hasFeatureFlag } from "lib/featureFlags";
import { useLayoutEffect } from "react";

export const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

/**
 * Read the user's preferred palette mode from the `prefers-color-scheme` media query
 * Updates live if the user changes their OS/browser preference
 * TODO: remove DARK_MODE feature flag once dark palette is fully implemented and tested
 */
export const usePaletteMode = (): PaletteMode => {
  // noSsr reads the media query on first render, avoiding a flash of the light theme
  const prefersDarkMode = useMediaQuery(DARK_MODE_QUERY, { noSsr: true });
  if (!hasFeatureFlag("DARK_MODE")) return "light";
  return prefersDarkMode ? "dark" : "light";
};

/**
 * Mirror the active palette mode onto <html data-theme="..."> so plain CSS/SCSS
 * (e.g. the flow graph in floweditor.scss) can follow the MUI theme
 */
export const useSyncPaletteModeAttribute = (mode: PaletteMode) => {
  // Layout effect avoids painting a frame with the wrong palette
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);
};
