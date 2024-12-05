import { getFeeBreakdown } from "@opensystemslab/planx-core";
import { FeeBreakdown } from "@opensystemslab/planx-core/types";
import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";

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
  if (!passportData) return;

  try {
    const feeBreakdown = getFeeBreakdown(passportData);
    return feeBreakdown;
  } catch (error) {
    logger.notify(
      `Failed to parse fee breakdown data from passport for session ${sessionId}. Error: ${error}`,
    );
    return;
  }
};
