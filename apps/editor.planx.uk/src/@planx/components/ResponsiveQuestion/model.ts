import { richText } from "lib/yupExtensions";
import { array, boolean, object, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  Option,
  optionValidationSchema,
  parseBaseNodeData,
  Response,
} from "../shared";

/**
 * Database representation of a ResponsiveQuestion component
 */
export interface ResponsiveQuestion extends BaseNodeData {
  fn: string;
  description?: string;
  img?: string;
  text?: string;
  neverAutoAnswer: boolean;
  alwaysAutoAnswerBlank: boolean;
}

/**
 * Editor representation of a ResponsiveQuestion component
 * This is the model used by Formik within the Editor modal
 * Contains options derived from child Answer nodes
 */
export type EditorResponsiveQuestion = ResponsiveQuestion & {
  options: Option[];
};

/**
 * Public representation of a ResponsiveQuestion component
 * Contains responses derived from child Answer nodes
 */
export type PublicResponsiveQuestion = ResponsiveQuestion & {
  responses: Response[];
};

export const parseResponsiveQuestion = (
  data: Record<string, any> | undefined,
): EditorResponsiveQuestion => ({
  fn: data?.fn || "",
  options: data?.options || [],
  description: data?.description || "",
  img: data?.img || "",
  text: data?.text || "",
  neverAutoAnswer: data?.neverAutoAnswer || false,
  alwaysAutoAnswerBlank: data?.alwaysAutoAnswerBlank || false,
  ...parseBaseNodeData(data),
});

export const validationSchema = baseNodeDataValidationSchema
  .concat(
    object({
      fn: string().nullable().required(),
      description: richText(),
      img: string(),
      text: string(),
      neverAutoAnswer: boolean(),
      alwaysAutoAnswerBlank: boolean(),
      options: array(optionValidationSchema).required(),
    }),
  )
  .test({
    name: "uniqueLabels",
    test: function ({ options }) {
      if (!options?.length) return true;

      const uniqueLabels = new Set(options.map(({ data }) => data.text));
      const areAllLabelsUnique = uniqueLabels.size === options.length;
      if (areAllLabelsUnique) return true;

      return this.createError({
        path: "options",
        message: "Options must have unique labels",
      });
    },
  });
