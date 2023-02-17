import { TYPES } from "@planx/components/types";
import { isPreviewOnlyDomain } from "routes/utils";
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

export type PublicStore = SharedStore & PreviewStore;

export type FullStore = PublicStore & EditorStore & EditorUIStore;

export const { vanillaStore, useStore } = (() => {
  const vanillaStore: StoreApi<FullStore> = (() => {
    if (isPreviewOnlyDomain || window?.location?.href?.includes("/preview")) {
      // if accessing the public preview, don't load editor store files
      return vanillaCreate<PublicStore>((...args) => ({
        ...sharedStore(...args),
        ...previewStore(...args),
      })) as unknown as StoreApi<FullStore>;
    } else {
      // if accessing the editor then load ALL store files
      const { editorStore, editorUIStore } = require("./editor");
      return vanillaCreate<FullStore>((...args) => ({
        ...sharedStore(...args),
        ...previewStore(...args),
        ...editorStore(...args),
        ...editorUIStore(...args),
      }));
    }
  })();

  return { vanillaStore, useStore: create(vanillaStore) };
})();

// having window.api in console is useful for debugging
(window as any)["api"] = useStore;
