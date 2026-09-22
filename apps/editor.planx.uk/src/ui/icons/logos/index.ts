import defaultLogo from "./default.svg?raw";
import localLogo from "./local.svg?raw";
import pizzaLogo from "./pizza.svg?raw";
import stagingLogo from "./staging.svg?raw";

const LOGOS_BY_ENVIRONMENT: Record<string, string> = {
  production: defaultLogo,
  staging: stagingLogo,
  pizza: pizzaLogo,
  development: localLogo,
};

// Default to PlanX blue, team colour will be used if available
const DEFAULT_GLYPH_COLOUR = "#0010A4";

export const getEnvironmentLogo = (colour: string): string => {
  const svg = (
    LOGOS_BY_ENVIRONMENT[import.meta.env.VITE_APP_ENV] ?? defaultLogo
  ).replaceAll(DEFAULT_GLYPH_COLOUR, colour);

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
