import { mostReadable } from "@ctrl/tinycolor";

export const getContrastTextColor = (
  bgColor: string,
  textColor: string,
): string | undefined =>
  mostReadable(bgColor, [textColor], {
    includeFallbackColors: true,
    level: "AA",
    size: "small",
  })?.toHexString();
