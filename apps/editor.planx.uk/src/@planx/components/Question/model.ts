import { richText } from "lib/yupExtensions";
import { array, boolean, object, string } from "yup";

import { Option, optionValidationSchema } from "../Option/model";
import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

/**
 * Database representation of a Question component
 */
export interface Question extends BaseNodeData {
  fn?: string;
  text?: string;
  description?: string;
  img?: string;
  neverAutoAnswer?: boolean;
  alwaysAutoAnswerBlank?: boolean;
}

/**
 * Public and Editor representation of a Question
 * Contains options derived from child Answer nodes
 */
export type QuestionWithOptions = Question & { options: Option[] };

export const validationSchema = baseNodeDataValidationSchema
  .concat(
    object({
      text: string().required(),
      description: richText(),
      img: string(),
      fn: string(),
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

export const parseQuestion = (
  data: Record<string, any> | undefined,
): QuestionWithOptions => ({
  fn: data?.fn || "",
  img: data?.img || "",
  options: data?.options || [],
  text: data?.text || "",
  neverAutoAnswer: data?.neverAutoAnswer || false,
  alwaysAutoAnswerBlank: data?.alwaysAutoAnswerBlank || false,
  ...parseBaseNodeData(data),
});
