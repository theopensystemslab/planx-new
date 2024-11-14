import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useRef } from "react";

const useScrollOnPreviousURLMatch = <T extends HTMLElement>(id: string) => {
  const previousURL = useStore((state) => state.previousURL);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const isReturningFromPortal = previousURL?.endsWith(id);
    if (!isReturningFromPortal) return;

    // Center node
    ref.current.scrollIntoView({
      block: "center",
      inline: "center",
    });

    // Visually highlight
    ref.current.classList.add("highlight-active");
  }, [previousURL, id]);

  return ref;
};

export default useScrollOnPreviousURLMatch;
