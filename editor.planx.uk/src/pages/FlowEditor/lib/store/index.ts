import { TYPES } from "@planx/components/types";
import { isPreviewOnlyDomain } from "routes/utils";
import { create, UseBoundStore } from "zustand";
import { createStore, StoreApi } from "zustand/vanilla";

import type { EditorStore, EditorUIStore } from "./editor";
import type { NavigationStore } from "./navigation";
import { navigationStore } from "./navigation";
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
    override?: Record<string, any>;
    feedback?: string;
  };
  export type breadcrumbs = Record<nodeId, userData>;
  export type cachedBreadcrumbs = Record<nodeId, userData> | undefined;
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

// XXX: We're 'tricking' typescript into thinking that it has access to a
//      complete store when it imports useStore, so that we have autocompletion
//      and linting support. However, we don't load editor store files in the
//      frontend because they do things like connect to sharedb, which is
//      not something that public users should be concerned with.

export type PublicStore = SharedStore & PreviewStore & NavigationStore;

export type FullStore = PublicStore & EditorStore & EditorUIStore;

interface PlanXStores {
  // Non-React implementation (e.g. for use in tests)
  vanillaStore: StoreApi<FullStore>;
  // React hook
  useStore: UseBoundStore<StoreApi<FullStore>>;
}

/**
 * If accessing the public preview, don't load editor store files
 * Cast to FullStore for autocomplete and linting
 */
const createPublicStore = (): StoreApi<FullStore> =>
  createStore<PublicStore>((...args) => ({
    ...sharedStore(...args),
    ...previewStore(...args),
    ...navigationStore(...args),
  })) as StoreApi<FullStore>;

/**
 * If accessing the editor then load ALL store files
 */
const createFullStore = (): StoreApi<FullStore> => {
  const { editorStore, editorUIStore } = require("./editor");
  return createStore<FullStore>((...args) => ({
    ...sharedStore(...args),
    ...previewStore(...args),
    ...navigationStore(...args),
    ...editorStore(...args),
    ...editorUIStore(...args),
  }));
};

const isPublic =
  isPreviewOnlyDomain || window?.location?.href?.includes("/preview");

export const { vanillaStore, useStore }: PlanXStores = (() => {
  const vanillaStore: StoreApi<FullStore> = (() =>
    isPublic ? createPublicStore() : createFullStore())();

  return { vanillaStore, useStore: create(vanillaStore) };
})();

// having window.api in console is useful for debugging
(window as any)["api"] = useStore;
