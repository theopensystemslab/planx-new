import { type JSONContent } from "@tiptap/core";
import { generateHTML, generateJSON } from "@tiptap/html";
import { map } from "ramda";
import { create } from "zustand";

import { conversionExtensions } from "./tiptapExtensions";
import { VariablesState } from "./types";

/**
 * Traverse a nested object/array and apply a modification at each level. If the modifier returns `null`, it leaves the result unchanged.
 * Used to inject placeholder values into a document structure.
 */
export const modifyDeep =
  (fn: (field: Value) => Value) =>
  (val: Value): Value => {
    if (!val) {
      return val;
    }
    const mod = fn(val);
    if (mod) {
      return mod;
    }
    if (Array.isArray(val)) {
      return map(modifyDeep(fn), val);
    }
    if (typeof val === "object") {
      return map(modifyDeep(fn), val);
    }
    return val;
  };

// Generic value that `modifyDeep` works off of. Since it can be object, array or primitive, any typing more accurate than `any` is not compiling at the moment.
// TODO: find a better typing alternative
type Value = any;

export const initialUrlValue = "https://";

// Makes sure that if the user pastes a full URL into the input, the pre-populated `https://` is removed
// e.g. https://https://something.com -> https://something.com
// Also trim whitespace from links which flag sanitation errors
export const trimUrlValue = (url: string) => {
  if (url.startsWith(`${initialUrlValue}${initialUrlValue}`)) {
    return url.slice(initialUrlValue.length);
  }
  return url.trim();
};

// Maintain a store of variables as they are created in the '@'-mention plugin, making them available in memory for next time.
// TODO: explore instantiating from a hard-coded list, or persisting in either the backend or local storage.
export const useVariablesStore = create<VariablesState>()((set) => ({
  variables: [],
  addVariable: (newVariable: string) =>
    set((state) => ({ variables: [...state.variables, newVariable] })),
}));

export const emptyContent = "<p></p>";

export const toHtml = (doc: JSONContent) => {
  const outgoingHtml = generateHTML(doc, conversionExtensions);
  return outgoingHtml === emptyContent ? "" : outgoingHtml;
};

export const fromHtml = (htmlString: string) => {
  return generateJSON(
    htmlString === "" ? emptyContent : htmlString,
    conversionExtensions,
  );
};

export const injectVariables = (
  htmlString: string,
  vars: Record<string, string>,
) => {
  const doc = fromHtml(htmlString);
  return toHtml(
    modifyDeep((node) => {
      return node.type === "mention"
        ? {
            ...node,
            type: "text",
            text: vars[node.attrs.id] || "Unknown",
            attrs: undefined,
          }
        : null;
    })(doc),
  );
};
