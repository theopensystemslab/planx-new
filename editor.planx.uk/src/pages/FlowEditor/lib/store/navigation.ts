import { TYPES } from "@planx/components/types";
import { hasFeatureFlag } from "lib/featureFlags";
import { Store } from "pages/FlowEditor/lib/store";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";

interface SectionNode extends Store.node {
  data: {
    title: string;
  };
}

export interface NavigationStore {
  currentSectionIndex: number;
  totalSectionCount?: number;
  currentSectionTitle?: string;
  isNavBarVisible: boolean;
  sectionNodes: SectionNode[];
  initNavigationStore: () => void;
  updateSection: (newTitle: string) => void;
}

export const navigationStore: StateCreator<
  NavigationStore & SharedStore,
  [],
  [],
  NavigationStore
> = (set, get) => ({
  currentSectionIndex: 0,

  totalSectionCount: undefined,

  currentSectionTitle: undefined,

  isNavBarVisible: false,

  sectionNodes: [],

  initNavigationStore: () => {
    const flow = get().flow;
    const sectionNodes = Object.values(flow).filter(
      (node) => node.type === TYPES.Section
    ) as SectionNode[];

    if (sectionNodes.length && hasFeatureFlag("NAVIGATION_UI")) {
      set({
        sectionNodes: sectionNodes,
        totalSectionCount: sectionNodes.length,
        currentSectionTitle: sectionNodes[0].data.title,
        isNavBarVisible: true,
      });
    }
  },

  updateSection: (newTitle) => {
    set({ currentSectionTitle: newTitle });
    const newSectionIndex =
      get().sectionNodes.findIndex((node) => node.data.title === newTitle) || 0;
    set({ currentSectionIndex: newSectionIndex + 1 });
  },
});
