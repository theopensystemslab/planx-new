import { useTheme } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useRef } from "react";

const useScrollOnPreviousURLMatch = <T extends HTMLElement>(
  urlMatcher: string,
) => {
  const previousURL = useStore((state) => state.previousURL);
  const ref = useRef<T | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!ref.current) return;

    const isReturningFromPortal = previousURL?.endsWith(urlMatcher);
    if (!isReturningFromPortal) return;

    // Center node
    ref.current.scrollIntoView({
      block: "center",
      inline: "center",
    });

    // Visually highlight node
    const keyframes: Keyframe[] = [
      { outline: `4px solid ${theme.palette.action.focus}`, outlineOffset: 0 },
      { outline: `4px solid transparent`, outlineOffset: 0 },
    ];

    const animationOptions: KeyframeAnimationOptions = {
      duration: 1500,
      easing: "ease-in",
    };

    ref.current.animate(keyframes, animationOptions);
  }, [previousURL, urlMatcher, theme]);

  return ref;
};

export default useScrollOnPreviousURLMatch;
