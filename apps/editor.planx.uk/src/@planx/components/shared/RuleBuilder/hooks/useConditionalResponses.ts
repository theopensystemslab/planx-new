import { ConditionalOption } from "@planx/components/Option/model";
import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";

import type { Group } from "../../BaseChecklist/model";
import { isRuleMet } from "../utils";

/**
 * Determines which options should be shown to the user
 *
 * Allow us to limit which options the user sees, based on their responses
 * so far. Uses the passport to evaluate each option's rule.
 *
 * @param options All possible options for the Question node
 * @param groupedOptions All possible grouped options for the Checklist node
 * @returns Subset of options and grouped options which the user should see
 */
export const useConditionalOptions = (
  options?: ConditionalOption[],
  groupedOptions?: Group<ConditionalOption>[],
): {
  conditionalOptions?: ConditionalOption[];
  groupedConditionalOptions?: Group<ConditionalOption>[];
} => {
  const passport = useStore((state) => state.computePassport());

  // Filter options
  const conditionalOptions = options?.length
    ? options.filter((option) => isRuleMet(passport, option.data.rule))
    : undefined;

  // Filter grouped options
  const groupedConditionalOptions = groupedOptions?.length
    ? groupedOptions
        .map((group) => ({
          ...group,
          children: group.children.filter((option) =>
            isRuleMet(passport, option.data.rule),
          ),
        }))
        .filter((group) => group.children.length > 0)
    : undefined;

  if (options?.length && conditionalOptions?.length === 0) {
    logNoOptionsWarning("conditional options", {
      passport,
      options,
      conditionalOptions,
    });
  }

  if (groupedOptions?.length && groupedConditionalOptions?.length === 0) {
    logNoOptionsWarning("conditional grouped options", {
      passport,
      groupedOptions,
      groupedConditionalOptions,
    });
  }

  return {
    conditionalOptions: conditionalOptions?.length
      ? conditionalOptions
      : undefined,
    groupedConditionalOptions: groupedConditionalOptions?.length
      ? groupedConditionalOptions
      : undefined,
  };
};

const logNoOptionsWarning = (
  optionType: string,
  context: Record<string, unknown>,
) => {
  const state = useStore.getState();
  logger.notify({
    message: `[Error]: User was presented with no ${optionType}`,
    flowId: state.id,
    nodeId: state.currentCard?.id,
    ...context,
  });
};
