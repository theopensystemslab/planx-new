import type { PublicProps } from "@planx/components/shared/types";
import { useServiceChargeFlowExceptions } from "hooks/data/useServiceChargeFlowExceptions";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import { type SetFee } from "./model";
import { getServiceChargeMode, handleSetFees } from "./utils";

export type Props = PublicProps<SetFee>;

export default function Component(props: Props) {
  const { applyCalculatedVAT, fastTrackFeeAmount, applyServiceCharge } = props;

  const [passport, flowId, { paymentProvider, contract }] = useStore(
    (state) => [state.computePassport(), state.id, state.teamSettings],
  );

  const { data } = useServiceChargeFlowExceptions();

  const serviceChargeMode = getServiceChargeMode(
    flowId,
    paymentProvider,
    contract,
    data,
  );

  useEffect(() => {
    const newValues = handleSetFees({
      passport,
      applyCalculatedVAT,
      fastTrackFeeAmount,
      applyServiceCharge,
      serviceChargeMode,
    });

    props.handleSubmit?.({
      data: newValues,
      auto: true,
    });
  }, [props, passport]);

  return null;
}
