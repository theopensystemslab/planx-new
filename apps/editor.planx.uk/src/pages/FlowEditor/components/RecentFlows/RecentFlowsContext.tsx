import React, { createContext, useCallback, useContext, useState } from "react";

const STORAGE_KEY = "planx:recentFlows";

export interface RecentFlow {
  id: string;
  folderIds: string[];
}

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
  // Hydrate recentFlows from sessionStorage
  const [recentFlows, setRecentFlows] = useState<RecentFlow[]>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });

  /**
   * Add recent flow and sync sessionStorage synchronously
   */
  const addRecentFlow = useCallback((flow: RecentFlow) => {
    setRecentFlows((prev) => {
      const next = [...prev, flow];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  /**
   * Drop one (or many) recent flows on navigation back "up" the list
   */
  const sliceRecentFlows = useCallback((toFlowId: string) => {
    setRecentFlows((prev) => {
      const idx = prev.findIndex(({ id }) => id === toFlowId);
      const next = idx >= 0 ? prev.slice(0, idx) : prev;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <RecentFlowsContext.Provider
      value={{ recentFlows, addRecentFlow, sliceRecentFlows }}
    >
      {children}
    </RecentFlowsContext.Provider>
  );
};

export const useRecentFlowsContext = () => useContext(RecentFlowsContext);

export const clearRecentFlowsStorage = () =>
  sessionStorage.removeItem(STORAGE_KEY);
