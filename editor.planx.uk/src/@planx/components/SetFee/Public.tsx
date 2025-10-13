import type { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import { type SetFee } from "./model";
import { handleSetFees } from "./utils";

export type Props = PublicProps<SetFee>;

export default function Component(props: Props) {
  const {
    applyCalculatedVAT,
    fastTrackFeeAmount,
    applyServiceCharge,
    applyPaymentProcessingFee,
  } = props;
  const passport = useStore().computePassport();

  useEffect(() => {
    const newValues = handleSetFees({
      passport,
      applyCalculatedVAT,
      fastTrackFeeAmount,
      applyServiceCharge,
      applyPaymentProcessingFee,
    });

    props.handleSubmit?.({
      data: newValues,
      auto: true,
    });
  }, [props, passport]);

  return null;
}
