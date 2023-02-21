import { hasFeatureFlag } from "lib/featureFlags";
import type { StateCreator } from "zustand";

export interface NavigationStore {
  currentSectionIndex: number;
  totalSectionCount: number;
  currentSectionTitle: string;
  isNavBarVisible: boolean;
}

export const navigationStore: StateCreator<
  NavigationStore,
  [],
  [],
  NavigationStore
> = (set) => ({
  currentSectionIndex: 1,
  totalSectionCount: 6,
  currentSectionTitle: "About your project",
  isNavBarVisible: hasFeatureFlag("NAVIGATION_UI"),
});
