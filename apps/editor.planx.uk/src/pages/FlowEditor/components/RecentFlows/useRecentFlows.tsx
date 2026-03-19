import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

const STORAGE_KEY = "planx:recentFlows";

/**
 * Auto-hydrates and persists TanStack Router state across standard link navigations
 *
 * **Why do we need this?**
 *
 * Standard `<Link>` clicks or `navigate()` calls always drop the router's `location.state` by default
 * Passing along state manually is possible, but would be a fragile solution - easy to forget, tedious to maintain
 *
 * This hook acts as a background safety net, continuously backing up the breadcrumb trail to `sessionStorage`
 * and instantly re-hydrates the router state if it detects a drop, allowing the user to maintain their journey
 * context within the FlowEditor.
 */
export const useRecentFlows = () => {
  const router = useRouter();

  const recentFlows = useRouterState({
    select: (s) => s.location.state?.recentFlows,
  });

  // Sync state to sessionStorage
  useEffect(() => {
    if (!recentFlows) return;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(recentFlows));
  }, [recentFlows]);

  // Re-hydrate router state where already present in sessionStorage
  useEffect(() => {
    if (recentFlows) return;

    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      router.navigate({
        replace: true,
        state: (prev) => ({ ...prev, recentFlows: JSON.parse(stored) }),
      });
    } catch {
      console.error("Corrupted recentFlows data");
    }
  }, [recentFlows, router]);

  return recentFlows || [];
};

/**
 * Clear recentFlows from sessionStorage
 * Navigating back to the root team page constitues a new user journey
 */
export const startNewRecentFlowsJourney = () =>
  sessionStorage.removeItem(STORAGE_KEY);
