import { TYPES } from "@planx/components/types";
import create from "zustand";
import vanillaCreate from "zustand/vanilla";

import type { EditorStore, EditorUIStore } from "./editor";
import { editorStore, editorUIStore } from "./editor";
import type { PreviewStore } from "./preview";
import { previewStore } from "./preview";
import type { SharedStore } from "./shared";
import { sharedStore } from "./shared";

export declare namespace Store {
  export type Store = Record<string | number | symbol, unknown>;
  export type nodeId = string;
  export type flow = Record<nodeId, node>;
  // TODO: fix this silly type!
  export type componentOutput =
    | Array<any | undefined | null>
    | any
    | undefined
    | null;
  export type userData = { answers: componentOutput; auto?: boolean };
  export type breadcrumbs = Record<nodeId, userData>;
  export type node = {
    id?: nodeId;
    type?: TYPES;
    data?: any;
    edges?: nodeId[];
  };
  export interface passport {
    initialData?: any;
    data?: any;
    info?: any;
  }
}

// We use a vanillaStore so that we can run unit tests without React
export const vanillaStore = vanillaCreate<
  SharedStore & EditorStore & EditorUIStore & PreviewStore
>((set, get) => ({
  ...sharedStore(set, get),
  ...editorStore(set, get),
  ...editorUIStore(set, get),
  ...previewStore(set, get),
}));

export const useStore = create(vanillaStore);

// having window.api in console is useful for debugging
(window as any)["api"] = useStore;
