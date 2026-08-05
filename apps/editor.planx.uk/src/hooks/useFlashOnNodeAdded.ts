import { useTheme } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useRef } from "react";

import { flashHighlight } from "./flashHighlight";

const useFlashOnNodeAdded = <T extends HTMLElement>(id: string) => {
  const [lastAddedNodeIds, clearLastAddedNodeIds] = useStore((state) => [
    state.lastAddedNodeIds,
    state.clearLastAddedNodeIds,
  ]);
  const ref = useRef<T | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    if (!lastAddedNodeIds?.includes(id)) return;

    flashHighlight(ref.current, theme);

    if (lastAddedNodeIds.at(-1) === id) clearLastAddedNodeIds();
  }, [lastAddedNodeIds, id, theme, clearLastAddedNodeIds]);

  return ref;
};

export default useFlashOnNodeAdded;
