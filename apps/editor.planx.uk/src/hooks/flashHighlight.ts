import { alpha, type Theme } from "@mui/material/styles";

export const flashHighlight = (el: HTMLElement, theme: Theme) => {
  const flashColor = theme.palette.info.dark;

  const keyframes: Keyframe[] = [
    { boxShadow: `0 0 0 0px ${alpha(flashColor, 1)}`, borderRadius: "2px" },
    { boxShadow: `0 0 0 16px ${alpha(flashColor, 0)}`, borderRadius: "8px" },
  ];

  const animationOptions: KeyframeAnimationOptions = {
    duration: 900,
    easing: "ease-out",
  };

  el.animate(keyframes, animationOptions);
};
