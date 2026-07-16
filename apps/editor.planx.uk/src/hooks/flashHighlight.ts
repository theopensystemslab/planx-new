import type { Theme } from "@mui/material/styles";

export const flashHighlight = (el: HTMLElement, theme: Theme) => {
  const keyframes: Keyframe[] = [
    { outline: `12px solid ${theme.palette.action.focus}`, outlineOffset: 0 },
    { outline: `4px solid transparent`, outlineOffset: 0 },
  ];

  const animationOptions: KeyframeAnimationOptions = {
    duration: 5000,
    easing: "ease-in",
  };

  el.animate(keyframes, animationOptions);
};
