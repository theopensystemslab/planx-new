import { Store } from "pages/FlowEditor/lib/store";

import { PAY_FN } from "../Pay/model";
import { DEFAULT_PAYMENT_PROCESSING_PERCENTAGE, VAT_PERCENTAGE } from "./model";

type HandleSetFees = (params: {
  passport: Store.Passport;
  applyCalculatedVAT: boolean;
  fastTrackFeeAmount: number;
  applyServiceCharge: boolean;
  serviceChargeAmount: number;
  applyPaymentProcessingFee: boolean;
}) => Store.Passport["data"];

export const handleSetFees: HandleSetFees = ({
  passport,
  applyCalculatedVAT,
  fastTrackFeeAmount,
  applyServiceCharge,
  serviceChargeAmount,
  applyPaymentProcessingFee,
}) => {
  // Calculated is incoming application fee including exemptions and reductions, exclusive of VAT
  const calculated = passport.data?.["application.fee.calculated"];

  // `application.fee.payable` is total amount to be paid to GOV PAY inclusive of VAT
  //   `application.fee.payable.VAT` is sum of all VAT-suffixed line items
  const payable = PAY_FN;
  const payableVAT = `${PAY_FN}.VAT`;

  // TODO - throw error if no incoming calculated OR incoming passport already has > 0 payable value ??

  // At minimum, set calculated = payable
  const fees = {
    [payable]: calculated || 0,
    [payableVAT]: 0,
  };

  // Order of all extra fees and charges matters from here forwards!
  if (applyCalculatedVAT) {
    const calculatedVAT = calculated * VAT_PERCENTAGE;

    fees["application.fee.calculated"] = calculated;
    fees["application.fee.calculated.VAT"] = calculatedVAT;
    fees[payable] = fees[payable] + calculatedVAT;
    fees[payableVAT] = calculatedVAT;
  }

  const addFastTrack =
    passport.data?.["application.fastTrack"] &&
    fastTrackFeeAmount &&
    fastTrackFeeAmount > 0;
  if (addFastTrack) {
    const fastTrackVAT = fastTrackFeeAmount * VAT_PERCENTAGE;

    fees["application.fee.fastTrack"] = fastTrackFeeAmount;
    fees["application.fee.fastTrack.VAT"] = fastTrackVAT;
    fees[payable] = fees[payable] + fastTrackFeeAmount + fastTrackVAT;
    fees[payableVAT] = fees[payableVAT] + fastTrackVAT;
  }

  const addServiceCharge = applyServiceCharge && fees[payable] >= 100;
  if (addServiceCharge) {
    const serviceChargeVAT = serviceChargeAmount * VAT_PERCENTAGE;

    fees["application.fee.serviceCharge"] = serviceChargeAmount;
    fees["application.fee.serviceCharge.VAT"] = serviceChargeVAT;
    fees[payable] = fees[payable] + serviceChargeAmount + serviceChargeVAT;
    fees[payableVAT] = fees[payableVAT] + serviceChargeVAT;
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
