import { FlowSettings, GlobalSettings } from "types";
import type { StateCreator } from "zustand";

export interface SettingsStore {
  flowSettings?: FlowSettings;
  setFlowSettings: (flowSettings?: FlowSettings) => void;
  globalSettings?: GlobalSettings;
  setGlobalSettings: (globalSettings: GlobalSettings) => void;
}

export const settingsStore: StateCreator<
  SettingsStore,
  [],
  [],
  SettingsStore
> = (set, get) => ({
  flowSettings: undefined,
  setFlowSettings: (flowSettings) => set({ flowSettings }),
  globalSettings: undefined,
  setGlobalSettings: (globalSettings) => set({ globalSettings }),
});
