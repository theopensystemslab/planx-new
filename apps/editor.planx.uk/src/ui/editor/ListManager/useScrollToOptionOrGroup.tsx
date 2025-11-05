import { useEffect } from "react";
import { useLocation } from "react-use";

/**
 * Scroll to an option, when its nodeId is used as a hash in the URL
 * @example nodes/:id/edit#nodeId
 *
 * Scroll to a group, when its index is used as a hash in the URL
 * @example nodes/:id/edit#group-123
 *
 * Used to navigate from an Answer component, or group, on the graph,
 * to the corresponding Option, or group, within a Question or
 * Checklist component
 */
export const useScrollToOptionOrGroup = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = hash.substring(1);
    const option = document.getElementById(id);
    option?.scrollIntoView({ behavior: "instant" });
  }, [hash, pathname]);
};
