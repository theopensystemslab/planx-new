import type { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import { useServiceChargeMode } from "./hooks";
import { type SetFee } from "./model";
import { handleSetFees } from "./utils";

export type Props = PublicProps<SetFee>;

export default function Component(props: Props) {
  const { applyCalculatedVAT, fastTrackFeeAmount, applyServiceCharge } = props;
  const passport = useStore((state) => state.computePassport());

  const serviceChargeMode = useServiceChargeMode();

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
