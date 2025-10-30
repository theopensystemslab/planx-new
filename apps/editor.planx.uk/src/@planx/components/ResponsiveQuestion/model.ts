import { richText } from "lib/yupExtensions";
import { array, boolean, object, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  Option,
  parseBaseNodeData,
} from "../shared";

export interface ResponsiveQuestion extends BaseNodeData {
  fn: string;
  // option with Rule?
  options: Option[];
  description?: string;
  img?: string;
  text?: string;
  neverAutoAnswer: boolean;
  alwaysAutoAnswerBlank: boolean;
}

export const parseResponsiveQuestion = (
  data: Record<string, any> | undefined,
): ResponsiveQuestion => ({
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
      options: array(
        object({
          data: object({
            text: string().required().trim(),
          }),
        }),
      ),
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
