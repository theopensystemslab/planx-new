import type { JSONContent } from "@tiptap/core";

interface GetContentErrorsConfig {
  shouldReport: ({
    marks,
    text,
  }: {
    marks:
      | {
          [key: string]: any;
          type: string;
          attrs?: Record<string, any> | undefined;
        }[]
      | undefined;
    text?: string;
  }) => boolean | undefined;
  errorMessage: string;
}

export const getContentErrors = (
  content: JSONContent | undefined = [],
  config: GetContentErrorsConfig,
): string | undefined => {
  let error: string | undefined;
  if (!content) return;

  content.forEach((child: JSONContent) => {
    if (!child.content) return;

    child.content.forEach(({ marks, text }) => {
      if (config.shouldReport({ marks, text })) {
        error = config.errorMessage;
      }
    });
  });
  return error;
};

export const getLinkNewTabError = (
  content: JSONContent | undefined = [],
): string | undefined => {
  return getContentErrors(content, {
    shouldReport: ({ marks, text }) => {
      const isLink = marks?.map(({ type }) => type).includes("link");
      const hasOpenTabText = text?.includes("(opens in a new tab)");

      return hasOpenTabText && !isLink;
    },
    errorMessage: 'Links must wrap the text "(opens in a new tab)"',
  });
};

export const getLegislationLinkError = (
  content: JSONContent | undefined = [],
): string | undefined => {
  const config = {
    shouldReport: ({ marks }) => {
      const isLink = marks?.map(({ type }) => type).includes("link");

      const hasMadeLinkEnding =
        isLink &&
        marks
          ?.map(({ attrs }) => {
            try {
              const url = attrs && new URL(attrs.href);
              const allowedHosts = [
                "legislation.gov.uk",
                "www.legislation.gov.uk",
              ];
              if (url?.hostname && allowedHosts.includes(url.hostname)) {
                return url?.pathname.endsWith("/made");
              }
            } catch (error) {
              return false;
            }
          })
          .includes(true);

      return hasMadeLinkEnding;
    },
    errorMessage:
      'Legislative policy links should not end in "/made" as these can be out of date.',
  } as GetContentErrorsConfig;

  return getContentErrors(content, config);
};

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
