import { alpha, type Theme } from "@mui/material/styles";
import { prefersReducedMotion } from "lib/reducedMotion";

export const flashHighlight = (el: HTMLElement, theme: Theme) => {
  const flashColor = theme.palette.info.dark;
  const reduceMotion = prefersReducedMotion();

  // Web Animations API ignores CSS media queries, so check here
  // Reduced motion fades a fixed outline instead of an expanding ring
  const keyframes: Keyframe[] = reduceMotion
    ? [
        { boxShadow: `0 0 0 4px ${alpha(flashColor, 1)}` },
        { boxShadow: `0 0 0 4px ${alpha(flashColor, 0)}` },
      ]
    : [
        {
          boxShadow: `0 0 0 0px ${alpha(flashColor, 1)}`,
          borderRadius: "2px",
        },
        {
          boxShadow: `0 0 0 16px ${alpha(flashColor, 0)}`,
          borderRadius: "8px",
        },
      ];

  const animationOptions: KeyframeAnimationOptions = {
    duration: reduceMotion ? 1500 : 900,
    easing: "ease-out",
  };

  el.animate(keyframes, animationOptions);
};
