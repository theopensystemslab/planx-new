import { ConditionalOption } from "@planx/components/Option/model";
import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";

import { isRuleMet } from "../utils";

export const useConditionalResponses = (
  options: ConditionalOption[],
): ConditionalOption[] => {
  const passport = useStore((state) => state.computePassport());
  const conditionalResponses = options.filter((option) =>
    isRuleMet(passport, option.data.rule),
  );

  if (!conditionalResponses.length) {
    // TODO: Test this!
    logger.notify({
      message:
        "[QuestionComponent]: User was presented with no conditional options",
      passport,
      options,
      conditionalResponses,
    });
  }

  return conditionalResponses;
};
