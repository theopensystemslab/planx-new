import { richText } from "lib/yupExtensions";
import { array, object, string } from "yup";

import { BaseNodeData, baseNodeDataValidationSchema, Option } from "../shared";

export interface Question extends BaseNodeData {
  fn?: string;
  text?: string;
  description?: string;
  img?: string;
  neverAutoAnswer?: boolean;
  alwaysAutoAnswerBlank?: boolean;
  options: Option[];
}

export const validationSchema = baseNodeDataValidationSchema
  .concat(
    object({
      description: richText(),
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
