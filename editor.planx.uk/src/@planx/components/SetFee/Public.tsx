import type { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";
import { Passport } from "types";

import { PAY_FN } from "../Pay/model";
import type { SetFee } from "./model";

export type Props = PublicProps<SetFee>;

export default function Component(props: Props) {
  const passport = useStore().computePassport();

  const makePassportData = (props: Props): Passport["data"] | undefined => {
    const { operation, fn, amount } = props;

    switch (operation) {
      case "calculateVAT":
        if (passport.data?.[fn]) {
          return {
            [fn]: passport.data[fn] * 1.2,
            [`${fn}.VAT`]: passport.data[fn] * 1.2 - passport.data[fn],
          };
        } else {
          return undefined;
        }
      default: // "addServiceCharge" & "addFastTrackFee" work the same mathematically
        if (amount && passport.data?.[PAY_FN]) {
          return {
            [PAY_FN]: passport.data[PAY_FN] + amount * 1.2,
            [fn]: amount,
            [`${fn}.VAT`]: amount * 1.2 - amount,
          };
        } else if (amount) {
          return {
            [PAY_FN]: 0 + amount * 1.2,
            [fn]: amount,
            [`${fn}.VAT`]: amount * 1.2 - amount,
          };
        } else {
          return undefined;
        }
    }
  };

  useEffect(() => {
    props.handleSubmit?.({
      data: makePassportData(props),
      auto: true,
    });
  }, []);

  return null;
}
