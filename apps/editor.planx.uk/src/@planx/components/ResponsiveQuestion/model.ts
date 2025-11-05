import { ConditionalOption } from "../Option/model";
import { parseBaseNodeData} from "../shared";
import { BaseQuestion } from "../shared/BaseQuestion/model";
import { Condition, Rule } from "../shared/RuleBuilder/types";

export type ResponsiveQuestion = BaseQuestion;

/**
 * Public and Editor representation of a ResponsiveQuestion
 * Contains options derived from child Answer nodes
 */
export type ResponsiveQuestionWithOptions = ResponsiveQuestion & { options: ConditionalOption[] };

export const parseResponsiveQuestion = (
  data: Record<string, any> | undefined,
): ResponsiveQuestionWithOptions => ({
  fn: data?.fn || "",
  img: data?.img || "",
  options: data?.options || [],
  text: data?.text || "",
  ...parseBaseNodeData(data),
});

export const DEFAULT_RULE: Rule = {
  condition: Condition.AlwaysRequired,
};