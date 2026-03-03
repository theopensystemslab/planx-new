import type { RegisteredRouter } from "@tanstack/react-router";
import type { StateCreator } from "zustand";

import type { SharedStore } from "./shared";

export interface RecentFlowEntry {
  team: string;
  flow: string;
  href: string;
}

export interface RecentFlowsStore {
  recentFlows: RecentFlowEntry[];
  initRecentFlowsTracking: (router: RegisteredRouter) => () => void;
}

const FLOW_URL_PATTERN = /^\/app\/([^/]+)\/([^/]+)/;
const SESSION_KEY = "planx:recentFlows";

/**
 * The display name of the flow we're navigating FROM, captured in
 * onBeforeNavigate before beforeLoad overwrites flowName in the shared store.
 */
let pendingFromFlowName: string | undefined = undefined;

/**
 * Deduplicates onResolved calls for the same navigation (e.g. from React
 * StrictMode double-invoking effects which creates duplicate subscriptions).
 * Keyed as "fromPathname→toPathname".
 */
let lastProcessedNavKey = "";

function parseFlowPathname(pathname: string): {
  teamSlug: string;
  rootFlowSlug: string;
  isFolder: boolean;
} | null {
  const match = pathname.match(FLOW_URL_PATTERN);
  if (!match) return null;
  const teamSlug = match[1];
  const [rootFlowSlug, ...folderIds] = decodeURIComponent(match[2]).split(",");
  return { teamSlug, rootFlowSlug, isFolder: folderIds.length > 0 };
}

function loadFromSession(currentPathname: string): RecentFlowEntry[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const { currentFlowHref, recentFlows } = JSON.parse(raw) as {
      currentFlowHref: string;
      recentFlows: RecentFlowEntry[];
    };
    const parsed = parseFlowPathname(currentPathname);
    if (!parsed || parsed.isFolder) return [];
    const flowHref = `/app/${parsed.teamSlug}/${parsed.rootFlowSlug}`;

    // Same flow: restore as-is (e.g. page refresh while already on this flow)
    if (flowHref === currentFlowHref) return recentFlows;

    // Back navigation via page refresh: the current flow is already in the list,
    // so restore only the entries that precede it
    const backIndex = recentFlows.findIndex((e) => e.href === flowHref);
    if (backIndex >= 0) return recentFlows.slice(0, backIndex);

    return [];
  } catch {
    return [];
  }
}

function saveToSession(
  currentFlowHref: string,
  recentFlows: RecentFlowEntry[],
): void {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ currentFlowHref, recentFlows }),
    );
  } catch {
    // Ignore storage errors
  }
}

export const recentFlowsStore: StateCreator<
  SharedStore & RecentFlowsStore,
  [],
  [],
  RecentFlowsStore
> = (set, get) => ({
  recentFlows: loadFromSession(window.location.pathname),

  initRecentFlowsTracking: (router: RegisteredRouter) => {
    /**
     * Capture the display name of the flow we're leaving BEFORE beforeLoad
     * runs and overwrites flowName in the shared store.
     *
     * The event's fromLocation is router.state.resolvedLocation — the previous
     * successfully-resolved location — and is reliable for all navigation types
     * including browser back/forward (popstate).
     */
    const unsubscribePreNav = router.subscribe("onBeforeNavigate", () => {
      pendingFromFlowName = get().flowName || undefined;
    });

    const unsubscribeResolved = router.subscribe("onResolved", (event) => {
      const toPathname = event.toLocation.pathname;
      const fromPathname = event.fromLocation?.pathname;

      // Deduplicate: same from→to pair already processed (double subscription)
      const navKey = `${fromPathname ?? ""}→${toPathname}`;
      if (navKey === lastProcessedNavKey) return;
      lastProcessedNavKey = navKey;

      const toParsed = parseFlowPathname(toPathname);
      if (!toParsed) return;

      // Folder (InternalPortal) navigation — skip entirely
      if (toParsed.isFolder) return;

      const newFlowHref = `/app/${toParsed.teamSlug}/${toParsed.rootFlowSlug}`;
      const { recentFlows } = get();

      // Back navigation: destination already in list → truncate to just before it
      const backIndex = recentFlows.findIndex((e) => e.href === newFlowHref);
      if (backIndex >= 0) {
        const updated = recentFlows.slice(0, backIndex);
        set({ recentFlows: updated });
        saveToSession(newFlowHref, updated);
        return;
      }

      const fromParsed = fromPathname ? parseFlowPathname(fromPathname) : null;

      if (fromParsed) {
        const fromRootHref = `/app/${fromParsed.teamSlug}/${fromParsed.rootFlowSlug}`;

        // Folder → same root flow (navigating up from an InternalPortal): skip
        if (fromRootHref === newFlowHref) return;

        // Came from a root flow or a folder of a different flow → ExternalPortal
        const entry: RecentFlowEntry = {
          team: fromParsed.teamSlug,
          flow: pendingFromFlowName || fromParsed.rootFlowSlug,
          href: fromRootHref,
        };
        const updated = [...recentFlows, entry];
        set({ recentFlows: updated });
        saveToSession(newFlowHref, updated);
        return;
      }

      // fromLocation is undefined: initial page load — keep existing state
      // (already loaded from sessionStorage at store initialisation)
      if (!fromPathname) return;

      // Navigated from a non-flow URL (team page, etc.) → direct access, reset
      const updated: RecentFlowEntry[] = [];
      set({ recentFlows: updated });
      saveToSession(newFlowHref, updated);
    });

    return () => {
      unsubscribePreNav();
      unsubscribeResolved();
    };
  },
});
