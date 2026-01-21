import { boolean, object } from "yup";

import { Option } from "../Option/model";
import {
  BaseQuestion,
  baseQuestionValidationSchema,
  parseBaseQuestion,
} from "../shared/BaseQuestion/model";

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
