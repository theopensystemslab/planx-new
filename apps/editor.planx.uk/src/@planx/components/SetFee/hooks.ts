import { useServiceChargeFlowExceptions } from "hooks/data/useServiceChargeFlowExceptions";
import { useStore } from "pages/FlowEditor/lib/store";

export type ServiceChargeMode = "autoEnable" | "autoDisable" | "edit";

/**
 * Determine how we should manage service charges for this flow based on its' team settings and exceptions.
 *
 * As part of the migration to Stripe, we want service charges to be "automatically applied" (_not_ publish dependent) for applicable teams + flows.
 *   Teams still using Gov Pay, or internal teams without any contract, should still be able to edit service charges via Set Fees and publish changes.
 */
export const useServiceChargeMode = (): ServiceChargeMode => {
  const [flowId, { paymentProvider, contract }] = useStore((state) => [
    state.id,
    state.teamSettings,
  ]);

  const { data } = useServiceChargeFlowExceptions();

  if (
    contract === "opt_out_sc" ||
    data?.exceptions?.some((exception) => exception.flowId === flowId)
  ) {
    return "autoDisable";
  } else if (paymentProvider === "stripe" && contract === "with_sc") {
    return "autoEnable";
  } else {
    return "edit";
  }
};
