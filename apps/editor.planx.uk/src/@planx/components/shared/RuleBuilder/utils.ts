import { Store } from "pages/FlowEditor/lib/store";

import { Condition, Rule } from "./types";

export const isRuleMet = (passport: Store.Passport, rule: Rule): boolean => {
  // Simple (non-conditional) rules always evaluate to true
  if (rule.condition === Condition.AlwaysRequired) return true;
  if (rule.condition === Condition.AlwaysRecommended) return true;
  if (rule.condition === Condition.NotRequired) return true;

  const passportVal = passport.data?.[rule.fn];
  if (!passportVal) return false;

  const isExactMatch = passportVal === rule.val;
  const isArray = Array.isArray(passportVal);
  const isExactMatchInArray = isArray && passportVal.includes(rule.val);
  const re = new RegExp(`^${rule.val}(\\..+| $)`);
  const isGranularMatchInArray =
    isArray && passportVal.some((value: string) => re.test(value));

  return isExactMatch || isExactMatchInArray || isGranularMatchInArray;
};

export const checkIfConditionalRule = (condition: Condition) =>
  [Condition.RecommendedIf, Condition.RequiredIf].includes(condition);

export const formatRule = (newCondition: Condition, rule: Rule): Rule => {
  const isConditionalRule = checkIfConditionalRule(newCondition);
  if (isConditionalRule) return { ...rule, condition: newCondition } as Rule;

  // Drop fields which are only required for ConditionalRules
  return { condition: newCondition } as Rule;
};
