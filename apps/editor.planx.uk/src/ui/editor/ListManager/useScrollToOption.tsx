import { useEffect } from "react";
import { useLocation } from "react-use";

/**
 * Scroll to an option, when its nodeId is used as a hash in the URL
 *
 * Used to navigate from an Answer component on the graph, to the
 * corresponding Option within a Question or Checklist component
 */
export const useScrollToOption = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = hash.substring(1);
    const option = document.getElementById(id);
    option?.scrollIntoView({ behavior: "smooth" });
  }, [hash, pathname]);
};
