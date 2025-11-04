import { ConditionalOption } from "../Option/model";
import { parseBaseNodeData} from "../shared";
import { BaseQuestion } from "../shared/BaseQuestion/model";

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
