import { TYPES } from "@planx/components/types";
import create from "zustand";
import vanillaCreate, { StoreApi } from "zustand/vanilla";

import type { EditorStore, EditorUIStore } from "./editor";
import type { PreviewStore } from "./preview";
import { previewStore } from "./preview";
import type { SharedStore } from "./shared";
import { sharedStore } from "./shared";

export declare namespace Store {
  export type Store = Record<string | number | symbol, unknown>;
  export type nodeId = string;
  export type flow = Record<nodeId, node>;
  export type userData = {
    answers?: Array<string>;
    data?: Record<string, any>;
    auto?: boolean;
  };
  export type breadcrumbs = Record<nodeId, userData>;
  export type node = {
    id?: nodeId;
    type?: TYPES;
    data?: any;
    edges?: nodeId[];
  };
  export interface passport {
    data?: Record<string, any>;
  }
}

export const { vanillaStore, useStore } = (() => {
  let vanillaStore;
  // if public-facing preview then don't initialize editor store (including sharedb)
  if (window?.location?.href?.endsWith("preview")) {
    vanillaStore = vanillaCreate<SharedStore & PreviewStore>((set, get) => ({
      ...sharedStore(set, get),
      ...previewStore(set, get),
    })) as StoreApi<SharedStore & EditorStore & EditorUIStore & PreviewStore>;
  } else {
    const { editorStore, editorUIStore } = require("./editor");
    vanillaStore = vanillaCreate<
      SharedStore & EditorStore & EditorUIStore & PreviewStore
    >((set, get) => ({
      ...sharedStore(set, get),
      ...editorStore(set, get),
      ...editorUIStore(set, get),
      ...previewStore(set, get),
    }));
  }

  return { vanillaStore, useStore: create(vanillaStore) };
})();

// having window.api in console is useful for debugging
(window as any)["api"] = useStore;
