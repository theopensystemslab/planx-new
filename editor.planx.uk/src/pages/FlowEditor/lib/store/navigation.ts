import { TYPES } from "@planx/components/types";
import { hasFeatureFlag } from "lib/featureFlags";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";

export interface NavigationStore {
  currentSectionIndex: number;
  totalSectionCount?: number;
  currentSectionTitle?: string;
  isNavBarVisible: boolean;
  initNavigationStore: () => void;
}

export const navigationStore: StateCreator<
  NavigationStore & SharedStore,
  [],
  [],
  NavigationStore
> = (set, get) => ({
  currentSectionIndex: 1,

  totalSectionCount: undefined,

  currentSectionTitle: undefined,

  isNavBarVisible: hasFeatureFlag("NAVIGATION_UI"),

  initNavigationStore: () => {
    const flow = get().flow;
    const sectionNodes = Object.values(flow).filter(
      (node) => node.type === TYPES.Section
    );
    set({
      totalSectionCount: sectionNodes.length,
      currentSectionTitle: sectionNodes[0].data.title,
    });
  },
});
