import type { JSONContent } from "@tiptap/core";

import { Variant } from "./types";

export type RichTextValidator = (
  content: JSONContent[],
  variant?: Variant,
) => string | undefined;

interface GetContentErrorsConfig {
  shouldReport: (content: JSONContent) => boolean;
  errorMessage: string;
}

/**
 * Traverse Tiptap JSONContent, checking each node for errors
 */
export const getContentErrors = (
  content: JSONContent,
  config: GetContentErrorsConfig,
): string | undefined => {
  let error: string | undefined;
  if (!content) return;

  content.forEach((child: JSONContent) => {
    if (child.type === "image") {
      if (config.shouldReport(child)) {
        error = config.errorMessage;
      }
    }

    if (!child.content) return;

    child.content.forEach((element) => {
      if (config.shouldReport(element)) {
        error = config.errorMessage;
      }
    });
  });

  return error;
};

export const getLinkNewTabError: RichTextValidator = (content) => {
  return getContentErrors(content, {
    shouldReport: ({ marks, text }) => {
      const isLink = marks?.map(({ type }) => type).includes("link");
      const hasOpenTabText = text?.includes("(opens in a new tab)");

      return Boolean(hasOpenTabText && !isLink);
    },
    errorMessage: 'Links must wrap the text "(opens in a new tab)".',
  });
};

export const getLegislationLinkError: RichTextValidator = (content) => {
  const config: GetContentErrorsConfig = {
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

      return Boolean(hasMadeLinkEnding);
    },
    errorMessage:
      'Legislative policy links should not end in "/made" as these can be out of date.',
  };

  return getContentErrors(content, config);
};

export const getImageAltTextErrors: RichTextValidator = (content) => {
  const config: GetContentErrorsConfig = {
    shouldReport: ({ type, attrs }) => {
      const isImage = type == "image";
      if (!isImage) return false;

      const missingAltText = Boolean(!attrs?.alt);
      return missingAltText;
    },
    errorMessage:
      "Accessibility error: Fallback (alternate) text must be assigned for all images.",
  };
  return getContentErrors(content, config);
};

export const getShortLinkTextError: RichTextValidator = (content) => {
  const config: GetContentErrorsConfig = {
    shouldReport: ({ text, marks }) => {
      if (!text) return false;

      const isLink = marks?.map(({ type }) => type).includes("link");
      if (!isLink) return false;

      const isNonDescriptiveLink = text.length < 8;
      return isNonDescriptiveLink;
    },
    errorMessage:
      "Make sure the link text accurately describes the what the link is for.",
  };

  return getContentErrors(content, config);
};

export const getNonDescriptiveLinkError: RichTextValidator = (content) => {
  const config: GetContentErrorsConfig = {
    shouldReport: ({ text, marks }) => {
      if (!text) return false;

      const isLink = marks?.map(({ type }) => type).includes("link");
      if (!isLink) return false;

      const isNonDescriptiveLink =
        text.toLowerCase().includes("click here") ||
        text.toLowerCase().includes("clicking here");

      return isNonDescriptiveLink;
    },
    errorMessage:
      "Links must be set over text that accurately describes what the link is for. Avoid generic language such as 'click here'.",
  };

  return getContentErrors(content, config);
};

/**
 * Traverse document search for heading hierarchy errors
 * As this is document level validation, not element level,
 * it is not wrapped in the getContentErrors() iterator
 */
export const getContentHierarchyError: RichTextValidator = (
  content,
  variant,
) => {
  const errors: string[] = [];
  if (!content) return;

  switch (variant) {
    case "rootLevelContent":
      validateRootLevelContent(content, errors);
      break;
    case "nestedContent":
    case "paragraphContent":
      // No validation carried out
      break;
    default:
      validateDefault(content, errors);
      break;
  }

  return errors.length > 0 ? errors.join(", ") : undefined;
};

const validateRootLevelContent = (
  nodes: NonNullable<JSONContent["content"]>,
  errors: string[],
) => {
  const firstNode = nodes[0];
  if (
    !firstNode ||
    firstNode.type !== "heading" ||
    firstNode.attrs?.level !== 1
  ) {
    errors.push("The document must start with a level 1 heading (H1).");
  }

  let h1Count = 0;
  let hasH1 = false;

  nodes.forEach((node) => {
    if (node.type !== "heading") return;

    const level = node.attrs?.level;

    if (level === 1) {
      h1Count++;
      hasH1 = true;
      if (h1Count > 1) {
        errors.push(
          "There cannot be more than one level 1 heading (H1) in the document.",
        );
      }
    }
    if (level === 2 && !hasH1) {
      errors.push(
        "A level 1 heading (H1) must come before a level 2 heading (H2).",
      );
    }
  });
};

const validateDefault = (
  nodes: NonNullable<JSONContent["content"]>,
  errors: string[],
) => {
  let h1Index = -1;
  let h2Index = -1;

  nodes.forEach((node, index) => {
    if (node.type !== "heading") return;

    const level = node.attrs?.level;

    if (level === 1) {
      h1Index = index;
    }
    if (level === 2) {
      if (h2Index === -1 && h1Index === -1) {
        h2Index = index;
      }
      if (h1Index === -1) {
        errors.push(
          "A level 2 heading (H2) must come before a level 3 heading (H3).",
        );
      }
    }
  });
};
