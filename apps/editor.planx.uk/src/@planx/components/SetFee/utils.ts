import { PassportFeeFields } from "@opensystemslab/planx-core/types";
import { Store } from "pages/FlowEditor/lib/store";
import { ConditionalPick } from "type-fest";

import { PAY_FN } from "../Pay/model";
import {
  DEFAULT_PAYMENT_PROCESSING_PERCENTAGE,
  DEFAULT_SERVICE_CHARGE_AMOUNT,
  DEFAULT_SERVICE_CHARGE_THRESHOLD,
  VAT_PERCENTAGE,
} from "./model";

type HandleSetFees = (params: {
  passport: Store.Passport;
  applyCalculatedVAT: boolean;
  fastTrackFeeAmount: number;
  applyServiceCharge: boolean;
  applyPaymentProcessingFee: boolean;
}) => Store.Passport["data"];

// SetFee outputs a partial subset of any `number` type PassportFeeFields, never `boolean` ones
type OutputFees = Partial<ConditionalPick<PassportFeeFields, number>>;

export const handleSetFees: HandleSetFees = ({
  passport,
  applyCalculatedVAT,
  fastTrackFeeAmount,
  applyServiceCharge,
  applyPaymentProcessingFee,
}): OutputFees => {
  // Calculated is base application fee exclusive of VAT
  //   Any exemptions or reductions will have already set `application.fee.payable`
  const CALCULATED_FN = "application.fee.calculated";
  const calculated = passport.data?.[CALCULATED_FN] || 0;
  const incomingPayable = passport.data?.[PAY_FN];

  // `application.fee.payable` is total amount to be paid to GOV PAY inclusive of VAT
  //   `application.fee.payable.VAT` is sum of all VAT-suffixed line items
  const payable = PAY_FN;
  const payableVAT = `${PAY_FN}.VAT`;

  // At minimum, set calculated = payable if payable does not exist yet
  const fees = {
    [payable]: incomingPayable >= 0 ? incomingPayable : calculated,
    [payableVAT]: 0,
    [CALCULATED_FN]: calculated,
  };

  // Order of all extra fees and charges matters from here forwards!
  if (applyCalculatedVAT) {
    const calculatedVAT = calculated * VAT_PERCENTAGE;

    fees[CALCULATED_FN] = calculated;
    fees[`${CALCULATED_FN}.VAT`] = calculatedVAT;
    fees[payable] = fees[payable] + calculatedVAT;
    fees[payableVAT] = calculatedVAT;

    // If calculated base application fee is VAT-able and has reductions or exemptions,
    //   ensure that payable and payable VAT are correctly adjusted
    const reductionOrExemptionFns = [
      "application.fee.reduction.alternative",
      "application.fee.reduction.parishCouncil",
      "application.fee.reduction.sports",
      "application.fee.exemption.disability",
      "application.fee.exemption.resubmission",
      "application.fee.exemption.demolition",
    ];
    const hasReductionOrExemption = reductionOrExemptionFns.some(
      (fn) => passport.data?.[fn]?.[0] === "true",
    );
    if (hasReductionOrExemption) {
      // TODO account for eg 50% reduction therefore -50% VAT, currently always -100%
      fees[payable] = fees[payable] - calculatedVAT;
      fees[payableVAT] = fees[payableVAT] - calculatedVAT;
    }
  }

  const addFastTrack = fastTrackFeeAmount > 0;
  if (addFastTrack) {
    // The fastTrackFeeAmount applies if `application.fastTrack` is present in the passport (any value is okay/expected, checking presence only)
    if (
      passport.data &&
      Object.hasOwn(passport.data, "application.fastTrack")
    ) {
      const fastTrackVAT = fastTrackFeeAmount * VAT_PERCENTAGE;

      fees["application.fee.fastTrack"] = fastTrackFeeAmount;
      fees["application.fee.fastTrack.VAT"] = fastTrackVAT;
      fees[payable] = fees[payable] + fastTrackFeeAmount + fastTrackVAT;
      fees[payableVAT] = fees[payableVAT] + fastTrackVAT;
    } else {
      // If a fastTrackFeeAmount is set, but `application.fastTrack` does not apply, still capture 0 for Gov Pay metadata reporting
      fees["application.fee.fastTrack"] = 0;
      fees["application.fee.fastTrack.VAT"] = 0;
    }
  }

  if (applyServiceCharge) {
    if (fees[payable] >= DEFAULT_SERVICE_CHARGE_THRESHOLD) {
      // When payable inclusive of VAT after FT before payment processing fees is >= treshold,
      //   then apply the default service charge amount plus VAT and re-calculate payable
      const serviceChargeAmount = DEFAULT_SERVICE_CHARGE_AMOUNT;
      const serviceChargeVAT = serviceChargeAmount * VAT_PERCENTAGE;

      fees["application.fee.serviceCharge"] = serviceChargeAmount;
      fees["application.fee.serviceCharge.VAT"] = serviceChargeVAT;
      fees[payable] = fees[payable] + serviceChargeAmount + serviceChargeVAT;
      fees[payableVAT] = fees[payableVAT] + serviceChargeVAT;
    } else {
      // If toggled `on` but below threshold, still capture 0 for Gov Pay metadata reporting
      fees["application.fee.serviceCharge"] = 0;
      fees["application.fee.serviceCharge.VAT"] = 0;
    }
  }

  if (applyPaymentProcessingFee) {
    const paymentProcessingAmount =
      fees[payable] * DEFAULT_PAYMENT_PROCESSING_PERCENTAGE;
    const paymentProcessingVAT = paymentProcessingAmount * VAT_PERCENTAGE;

    fees["application.fee.paymentProcessing"] = paymentProcessingAmount;
    fees["application.fee.paymentProcessing.VAT"] = paymentProcessingVAT;
    fees[payable] =
      fees[payable] + paymentProcessingAmount + paymentProcessingVAT;
    fees[payableVAT] = fees[payableVAT] + paymentProcessingVAT;
  }

  return fees;
};
