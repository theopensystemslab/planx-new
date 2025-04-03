import type { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import type { SetFee } from "./model";

export type Props = PublicProps<SetFee>;

export default function Component(props: Props) {
  const passport = useStore().computePassport();

  // const makePassportData = (props: Props): Passport["data"] | undefined => {
  //   const { operation, fn } = props;
  //   const amount = Number(props.amount);

  //   const VAT_MULTIPLIER = 1.2;
  //   const fnPlusVAT = passport.data?.[fn] * VAT_MULTIPLIER;
  //   const amountPlusVAT = amount * VAT_MULTIPLIER;

  //   switch (operation) {
  //     case "calculateVAT":
  //       if (passport.data?.[fn]) {
  //         return {
  //           [fn]: fnPlusVAT,
  //           [`${fn}.VAT`]: fnPlusVAT - passport.data[fn],
  //         };
  //       } else {
  //         return undefined; // TODO throw error - can't calculate VAT on undefined ??
  //       }
  //     default: // "addServiceCharge" & "addFastTrackFee" work the same mathematically
  //       return {
  //         [PAY_FN]: (passport.data?.[PAY_FN] || 0) + amountPlusVAT,
  //         [fn]: amount,
  //         [`${fn}.VAT`]: amountPlusVAT - amount,
  //       };
  //   }
  // };

  useEffect(() => {
    props.handleSubmit?.({
      // data: makePassportData(props),
      data: props,
      auto: true,
    });
  });

  return null;
}
