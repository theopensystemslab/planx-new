import { richText } from "lib/yupExtensions";
import type { SchemaOf } from "yup";
import { array, boolean, mixed, object, string } from "yup";

import type { BaseNodeData } from "../shared";
import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";
import type { Rule } from "../shared/RuleBuilder/types";
import { Condition } from "../shared/RuleBuilder/types";

export interface NextSteps extends BaseNodeData {
  title: string;
  description?: string;
  steps: Array<Step>;
  hasStepRules?: boolean;
}

export interface Step {
  title: string;
  description?: string;
  url?: string;
  rule?: Rule;
}

export const DEFAULT_RULE: Rule = {
  condition: Condition.AlwaysRequired,
};

export const parseNextSteps = (
  data: Record<string, any> | undefined,
): NextSteps => ({
  steps: data?.steps || [],
  title: data?.title || DEFAULT_TITLE,
  description: data?.description || "",
  hasStepRules: data?.hasStepRules || false,
  ...parseBaseNodeData(data),
});

const DEFAULT_TITLE = "What would you like to do next?";

export const validationSchema: SchemaOf<NextSteps> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
      hasStepRules: boolean(),
      steps: array(
        object({
          title: string().required(),
          description: string(),
          url: string().url(),
          rule: mixed(),
        }),
      ).min(1),
    }),
  );
