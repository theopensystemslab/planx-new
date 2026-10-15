import type { TestConfig } from "yup";
import { array, object } from "yup";

import type { ConditionalOption } from "../Option/model";
import { optionValidationSchema } from "../Option/model";
import type { BaseQuestion } from "../shared/BaseQuestion/model";
import {
  baseQuestionValidationSchema,
  parseBaseQuestion,
} from "../shared/BaseQuestion/model";
import { uniqueOptionsTest } from "../shared/helpers";
import type { Rule } from "../shared/RuleBuilder/types";
import { Condition } from "../shared/RuleBuilder/types";

export type ResponsiveQuestion = BaseQuestion;

/**
 * Public and Editor representation of a ResponsiveQuestion
 * Contains options derived from child Answer nodes
 */
export type ResponsiveQuestionWithOptions = ResponsiveQuestion & {
  options: ConditionalOption[];
};

export const validationSchema = baseQuestionValidationSchema.concat(
  object({
    options: array(optionValidationSchema)
      .required()
      .test(uniqueOptionsTest as TestConfig<unknown>),
  }),
);

export const parseResponsiveQuestion = (
  data: Record<string, any> | undefined,
): ResponsiveQuestionWithOptions => ({
  options: data?.options || [],
  ...parseBaseQuestion(data),
});

export const DEFAULT_RULE: Rule = {
  condition: Condition.AlwaysRequired,
};
