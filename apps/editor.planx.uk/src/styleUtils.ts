import { mostReadable, readability, TinyColor } from "@ctrl/tinycolor";

export const getContrastTextColor = (
  bgColor: string,
  textColor: string,
): string | undefined =>
  mostReadable(bgColor, [textColor], {
    includeFallbackColors: true,
    level: "AA",
    size: "small",
  })?.toHexString();

/**
 * Lighten a colour until it meets the given contrast ratio against a dark background
 * Used to keep team colours, chosen against a white background, legible in dark mode
 */
export const ensureContrastOnDark = (
  color: string,
  bgColor: string,
  minContrast = 4.5,
): string => {
  let adjusted = new TinyColor(color);
  while (
    readability(adjusted, bgColor) < minContrast &&
    !adjusted.equals("#FFFFFF")
  ) {
    adjusted = adjusted.lighten(2);
  }
  return adjusted.toHexString();
};
