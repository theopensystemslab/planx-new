import { JSONContent } from "@tiptap/core";
import { Variant } from "ui/editor/RichTextInput/types";
import { fromHtml } from "ui/editor/RichTextInput/utils";
import {
  getContentHierarchyError,
  getImageAltTextErrors,
  getLegislationLinkError,
  getLinkNewTabError,
  getNonDescriptiveLinkError,
  getShortLinkTextError,
  RichTextValidator,
} from "ui/editor/RichTextInput/validationHelpers";
import { mixed } from "yup";

interface Options {
  variant?: Variant;
}

interface ValidationCheck {
  name: string;
  validator: RichTextValidator;
}

/**
 * Custom Yup schema describing the validation rules for a RichTextInput
 * Checks for both valid content, as well as HTML which adheres to a11y recommendations
 */
export const richText = ({ variant }: Options | undefined = {}) => {
  // Transform HTML string to tiptap JSON for easier traversal and validation
  let schema = mixed().transform(
    (_value, originalValue): JSONContent | undefined => {
      if (!originalValue) return undefined;
      return fromHtml(originalValue);
    },
  );

  const validationChecks: ValidationCheck[] = [
    {
      name: "content-hierarchy-check",
      validator: (content) => getContentHierarchyError(content, variant),
    },
    {
      name: "link-new-tab-check",
      validator: getLinkNewTabError,
    },
    {
      name: "legislation-link-check",
      validator: getLegislationLinkError,
    },
    {
      name: "non-descriptive-link-check",
      validator: getNonDescriptiveLinkError,
    },
    {
      name: "short-link-text-check",
      validator: getShortLinkTextError,
    },
    {
      name: "image-alt-text-check",
      validator: getImageAltTextErrors,
    },
  ];

  // Apply validation checks to generated schema as Yup test()s
  validationChecks.forEach(({ name, validator }) => {
    schema = schema.test(name, function (value: JSONContent) {
      if (!value) return true;

      const errorMessage = validator(value.content || [], variant);
      if (!errorMessage) return true;

      return this.createError({ message: errorMessage });
    });
  });

  return schema;
};
