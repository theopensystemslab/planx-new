import type { TestConfig } from "yup";
import { array, boolean, object } from "yup";

import type { Option } from "../Option/model";
import { optionValidationSchema } from "../Option/model";
import type { BaseQuestion } from "../shared/BaseQuestion/model";
import {
  baseQuestionValidationSchema,
  parseBaseQuestion,
} from "../shared/BaseQuestion/model";
import { uniqueLabelsTest } from "../shared/helpers";

/**
 * Database representation of a Question component
 */
export interface Question extends BaseQuestion {
  neverAutoAnswer?: boolean;
  alwaysAutoAnswerBlank?: boolean;
}

/**
 * Public and Editor representation of a Question
 * Contains options derived from child Answer nodes
 */
export type QuestionWithOptions = Question & { options: Option[] };

export const validationSchema = baseQuestionValidationSchema.concat(
  object({
    neverAutoAnswer: boolean(),
    alwaysAutoAnswerBlank: boolean(),
    options: array(optionValidationSchema)
      .required()
      .test(uniqueLabelsTest as TestConfig<unknown>),
  }),
);

export const parseQuestion = (
  data: Record<string, any> | undefined,
): QuestionWithOptions => ({
  options: data?.options || [],
  neverAutoAnswer: data?.neverAutoAnswer || false,
  alwaysAutoAnswerBlank: data?.alwaysAutoAnswerBlank || false,
  ...parseBaseQuestion(data),
});
