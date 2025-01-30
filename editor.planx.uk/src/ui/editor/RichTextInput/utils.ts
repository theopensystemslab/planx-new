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

export const getContentHierarchyError = (doc: JSONContent): string | null => {
  let h1Index = -1;
  let h2Index = -1;

  let error: string | null = null;

  (doc.content || []).forEach((d: JSONContent, index) => {
    if (d.type === "paragraph") {
      return;
    } else if (d.type === "heading") {
      const level = d.attrs?.level === 1 ? 1 : 2;
      if (level === 1) {
        if (h1Index === -1 && h2Index !== -1) {
          error = "A level 1 heading must come before a level 2 heading.";
        } else if (h1Index !== -1) {
          error =
            "There cannot be more than one level 1 heading in the document.";
        } else if (index !== 0) {
          error = "The level 1 heading must come first in the document.";
        }
        h1Index = index;
        return;
      }
      if (level === 2) {
        if (h1Index === -1) {
          error = "A level 1 heading must come before a level 2 heading.";
        }
        h2Index = index;
        return;
      }
    }
    return null;
  });

  return error;
};

// Maintain a store of variables as they are created in the '@'-mention plugin, making them available in memory for next time.
// TODO: explore instantiating from a hard-coded list, or persisting in either the backend or local storage.
export const useVariablesStore = create<VariablesState>()((set) => ({
  variables: [],
  addVariable: (newVariable: string) =>
    set((state) => ({ variables: [...state.variables, newVariable] })),
}));

export const emptyContent = "<p></p>";

// Specify whether a selection is unsuitable for ensuring accessible links
export const linkSelectionError = (selectionHtml: string): string | null => {
  if (selectionHtml.startsWith("<p>") && selectionHtml.endsWith("</p>")) {
    const text = selectionHtml.slice(3, -4);
    const lowercaseText = text.toLowerCase().trim().replace(/[.,]/g, "");
    if (lowercaseText === "click here" || lowercaseText === "clicking here") {
      return "Links must be set over text that accurately describes what the link is for. Avoid generic language such as 'click here'.";
    }
    if (text[0] && text[0] !== text[0].toUpperCase() && text.length < 8) {
      return "Make sure the link text accurately describes the what the link is for.";
    }
  }
  return null;
};

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

export const getLinkNewTabError = (
  content: JSONContent | undefined = [],
): string | undefined => {
  let error: string | undefined;
  if (!content) return;

  content.forEach((child: JSONContent) => {
    if (!child.content) return;

    child.content.forEach(({ marks, text }) => {
      const isLink = marks?.map(({ type }) => type).includes("link");
      const hasOpenTabText = text?.includes("(opens in a new tab)");

      if (hasOpenTabText && !isLink) {
        error = 'Links must wrap the text "(opens in a new tab)"';
      }
    });
  });

  return error;
};
