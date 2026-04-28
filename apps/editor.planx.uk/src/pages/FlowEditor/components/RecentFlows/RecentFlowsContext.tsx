import { useRouterState } from "@tanstack/react-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export const STORAGE_KEY = "planx:recentFlows";

export interface RecentFlow {
  id: string;
  folderIds: string[];
}

/**
 * Maps each TanStack Router history key to the breadcrumb journey at that point
 * Stored in sessionStorage so tab refresh can restore the most recent state
 */
type JourneyMap = Record<string, RecentFlow[]>;

interface RecentFlowsContextValue {
  recentFlows: RecentFlow[];
  addRecentFlow: (flow: RecentFlow) => void;
  sliceRecentFlows: (toFlowId: string) => void;
}

export const RecentFlowsContext = createContext<RecentFlowsContextValue>({
  recentFlows: [],
  addRecentFlow: () => {},
  sliceRecentFlows: () => {},
});

export const RecentFlowsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Subscribe to the router's per-history-entry key
  // Each push/replace gets a unique key
  // Browser back/forward restores an earlier key
  const currentKey = useRouterState({
    select: (s) =>
      s.location.state.__TSR_key ?? s.location.state.key ?? "initial",
  });

  const [journeyMap, setJourneyMap] = useState<JourneyMap>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const map: JourneyMap = stored ? JSON.parse(stored) : {};
      if (!map[currentKey]) map[currentKey] = [];

      return map;
    } catch {
      return { [currentKey]: [] };
    }
  });

  const prevKeyRef = useRef<string>(currentKey);
  const pendingAddRef = useRef<RecentFlow | null>(null);
  const pendingSliceRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevKeyRef.current === currentKey) return;

    const prevKey = prevKeyRef.current;
    prevKeyRef.current = currentKey;

    const pendingAdd = pendingAddRef.current;
    pendingAddRef.current = null;

    const pendingSlice = pendingSliceRef.current;
    pendingSliceRef.current = null;

    setJourneyMap((prev) => {
      // Known key: browser back/forward restoring an earlier history entry
      // The recorded journey for that key is already correct - no update needed
      if (prev[currentKey]) return prev;

      // Unknown key: fresh navigation
      // Derive the new journey from the previous key's journey and any pending
      // operation that was queued before navigation
      const prevJourney = prev[prevKey] ?? [];
      let newJourney: RecentFlow[];

      if (pendingAdd) {
        // Portal click: record current flow as an ancestor in the new location
        newJourney = [...prevJourney, pendingAdd];
      } else if (pendingSlice !== null) {
        // Breadcrumb click: remove everything from the target flow onwards
        const idx = prevJourney.findIndex(({ id }) => id === pendingSlice);
        newJourney = idx >= 0 ? prevJourney.slice(0, idx) : [];
      } else {
        // Intra-flow navigation (modal open, node type change, etc): preserve journey
        newJourney = prevJourney;
      }

      const updated = { ...prev, [currentKey]: newJourney };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [currentKey]);

  /**
   * Use a ref to store the intent of this action - we are navigating into a portal
   */
  const addRecentFlow = useCallback((flow: RecentFlow) => {
    pendingAddRef.current = flow;
  }, []);

  /**
   * Use a ref to store the intent of this action - we are navigating one (or more) steps up the breadcrumbs
   */
  const sliceRecentFlows = useCallback((toFlowId: string) => {
    pendingSliceRef.current = toFlowId;
  }, []);

  const recentFlows =
    journeyMap[currentKey] ?? journeyMap[prevKeyRef.current] ?? [];

  return (
    <RecentFlowsContext.Provider
      value={{ recentFlows, addRecentFlow, sliceRecentFlows }}
    >
      {children}
    </RecentFlowsContext.Provider>
  );
};

export const useRecentFlowsContext = () => useContext(RecentFlowsContext);

export const startNewRecentFlowsJourney = () =>
  sessionStorage.removeItem(STORAGE_KEY);
