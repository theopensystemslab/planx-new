import { ConditionalOption } from "../Option/model";
import {
  BaseChecklist,
  parseBaseChecklist,
} from "../shared/BaseChecklist/model";
import { Condition, Rule } from "../shared/RuleBuilder/types";

export type ResponsiveChecklist = BaseChecklist;

/**
 * Public and Editor representation of a ResponsiveChecklist
 * Contains options derived from child Answer nodes
 */
export type ResponsiveChecklistWithOptions = ResponsiveChecklist & {
  options: ConditionalOption[];
};

export const parseResponsiveChecklist = (
  data: Record<string, any> | undefined,
): ResponsiveChecklistWithOptions => ({
  options: data?.options || [],
  ...parseBaseChecklist(data),
});

export const DEFAULT_RULE: Rule = {
  condition: Condition.AlwaysRequired,
};
