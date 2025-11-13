import { ConditionalOption } from "@planx/components/Option/model";
import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";

import { isRuleMet } from "../utils";

/**
 * Determines which options should be shown to the user
 *
 * Allow us to limit which options the user sees, based on their responses
 * so far. Uses the passport to evaluate each option's rule.
 *
 * @param responses All possible options for the Question node
 * @returns Subset of options which the user should see
 */
export const useConditionalResponses = (
  options: ConditionalOption[],
): ConditionalOption[] => {
  const passport = useStore((state) => state.computePassport());
  const conditionalResponses = options.filter((option) =>
    isRuleMet(passport, option.data.rule),
  );

  if (!conditionalResponses.length) {
    logger.notify({
      message:
        "[QuestionComponent]: User was presented with no conditional options",
      passport,
      options,
      conditionalResponses,
      flowId: useStore.getState().id,
      nodeId: useStore.getState().currentCard?.id,
    });
  }

  return conditionalResponses;
};
