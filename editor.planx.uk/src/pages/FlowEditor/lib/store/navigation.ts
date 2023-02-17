import { StateCreator } from "zustand/vanilla";

export interface NavigationStore {
  navTest: string;
  setNavTest: (navTest: string) => void;
}

export const navigationStore: StateCreator<
  NavigationStore,
  [],
  [],
  NavigationStore
> = (set) => ({
  navTest: "default value",
  setNavTest: (navTest: string) => set({ navTest }),
});
