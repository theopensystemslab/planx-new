import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";

import { FeeBreakdown } from "./types";
import { createPassportSchema } from "./utils";

export const useFeeBreakdown = (): FeeBreakdown | undefined => {
  const [passportData, sessionId] = useStore((state) => [
    state.computePassport().data,
    state.sessionId,
  ]);
  const schema = createPassportSchema();
  const result = schema.safeParse(passportData);

  // Unable to parse fee data from passport, do not show FeeBreakdown component
  if (!result.success) {
    logger.notify(
      `Failed to parse fee breakdown data from passport for session ${sessionId}. Error: ${result.error}`,
    );
    return;
  }

  return result.data;
};
