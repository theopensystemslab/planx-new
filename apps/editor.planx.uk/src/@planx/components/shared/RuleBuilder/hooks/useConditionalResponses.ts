import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";

import { DEFAULT_RULE, Response } from "../..";
import { isRuleMet } from "../utils";

/**
 * Determines which responses should be shown to the user
 *
 * Allow us to limit which responses the user sees, based on their responses
 * so far. Uses the passport to evaluate each response's rule.
 *
 * @param responses All possible responses for the Question node
 * @returns Subset of responses which the user should see
 */
export const useConditionalResponses = (responses: Response[]): Response[] => {
  const passport = useStore((state) => state.computePassport());
  const conditionalResponses = responses.filter((response) =>
    isRuleMet(passport, response.rule || DEFAULT_RULE),
  );

  if (!conditionalResponses.length) {
    logger.notify({
      message:
        "[QuestionComponent]: User was presented with no conditional options",
      passport,
      responses,
      flowId: useStore.getState().id,
      nodeId: useStore.getState().currentCard?.id,
    });
  }

  return conditionalResponses;
};
