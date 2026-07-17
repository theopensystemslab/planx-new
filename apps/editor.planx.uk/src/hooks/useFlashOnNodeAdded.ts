import { useTheme } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useRef } from "react";

import { flashHighlight } from "./flashHighlight";

const useFlashOnNodeAdded = <T extends HTMLElement>(id: string) => {
  const [lastAddedNodeId, clearLastAddedNodeId] = useStore((state) => [
    state.lastAddedNodeId,
    state.clearLastAddedNodeId,
  ]);
  const ref = useRef<T | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    if (lastAddedNodeId !== id) return;

    flashHighlight(ref.current, theme);
    clearLastAddedNodeId();
  }, [lastAddedNodeId, id, theme, clearLastAddedNodeId]);

  return ref;
};

export default useFlashOnNodeAdded;
