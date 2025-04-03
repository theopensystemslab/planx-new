import type { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import { type SetFee } from "./model";
import { handleSetFees } from "./utils";

export type Props = PublicProps<SetFee>;

export default function Component(props: Props) {
  const { applyCalculatedVAT, serviceChargeAmount, applyPaymentProcessingFee } =
    props;
  const fastTrackFeeAmount = Number(props.fastTrackFeeAmount || 0);

  const passport = useStore().computePassport();

  useEffect(() => {
    const newValues = handleSetFees({
      passport,
      applyCalculatedVAT,
      fastTrackFeeAmount,
      serviceChargeAmount,
      applyPaymentProcessingFee,
    });

    props.handleSubmit?.({
      data: newValues,
      auto: true,
    });
  }, [props, passport]);

  return null;
}
