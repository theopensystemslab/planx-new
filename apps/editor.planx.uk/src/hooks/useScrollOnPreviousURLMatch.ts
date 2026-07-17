import { useTheme } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useRef } from "react";

import { flashHighlight } from "./flashHighlight";

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
    flashHighlight(ref.current, theme);
  }, [previousURL, urlMatcher, theme]);

  return ref;
};

export default useScrollOnPreviousURLMatch;
