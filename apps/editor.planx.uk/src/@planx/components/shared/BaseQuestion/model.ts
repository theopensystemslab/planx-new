import { ComponentType } from "@opensystemslab/planx-core/types";
import { Option, optionValidationSchema } from "@planx/components/Option/model";
import { richText } from "lib/yupExtensions";
import { array, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "..";
import { Child } from "../types";

/**
 * Base fields shared between Question and ResponsiveQuestion components
 */
export interface BaseQuestion extends BaseNodeData {
  fn?: string;
  text?: string;
  description?: string;
  img?: string;
}

export const baseQuestionValidationSchema: SchemaOf<BaseQuestion> =
  baseNodeDataValidationSchema
    .concat(
      object({
        text: string().required(),
        description: richText(),
        img: string(),
        fn: string(),
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

/**
 * Build child nodes from generated options
 */
export const buildChildren = (options: Option[]): Child[] =>
  options
    .filter((o) => o.data.text)
    .map((o) => ({
      id: o.id || undefined,
      type: ComponentType.Answer,
      data: o.data,
    }));

export const parseBaseQuestion = (
  data: Record<string, any> | undefined,
): BaseQuestion => ({
  fn: data?.fn || "",
  text: data?.text || "",
  description: data?.description || "",
  img: data?.img || "",
  ...parseBaseNodeData(data),
});

export enum QuestionLayout {
  Basic,
  Images,
  Descriptions,
}
