import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";

import { FeeBreakdown } from "./types";
import { createPassportSchema } from "./utils";

/**
 * Parses the users's Passport for data variables associated with their fee
 * Currently relies on static `application.fee.x` variables
 *
 * If fee variables not found, or not successfully parsed, we do not show the user a fee breakdown
 * Instead an internal error will be raised allowing us to correct the flow content
 */
export const useFeeBreakdown = (): FeeBreakdown | undefined => {
  const [passportData, sessionId] = useStore((state) => [
    state.computePassport().data,
    state.sessionId,
  ]);
  if (!passportData) return 

  const schema = createPassportSchema();
  const result = schema.safeParse(passportData);

  if (!result.success) {
    logger.notify(
      `Failed to parse fee breakdown data from passport for session ${sessionId}. Error: ${result.error}`,
    );
    return;
  }

  return result.data;
};
