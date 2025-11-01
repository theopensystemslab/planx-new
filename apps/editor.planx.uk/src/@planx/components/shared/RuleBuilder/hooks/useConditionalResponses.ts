import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";

import { DEFAULT_RULE, Response } from "../..";
import { isRuleMet } from "../utils";

export const useConditionalResponses = (responses: Response[]): Response[] => {
  const passport = useStore((state) => state.computePassport());
  const conditionalResponses = responses.filter((response) =>
    isRuleMet(passport, response.rule || DEFAULT_RULE),
  );

  if (!conditionalResponses.length) {
    // TODO: Test this!
    logger.notify({
      message:
        "[QuestionComponent]: User was presented with no conditional options",
      passport,
      responses,
      conditionalResponses,
    });
  }

  return conditionalResponses;
};
