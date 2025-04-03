import { PAY_FN } from "../Pay/model";
import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface SetFee extends BaseNodeData {
  applyCalculatedVAT: boolean;
  fastTrackFeeAmount?: number;
  serviceChargeAmount: number;
  applyPaymentProcessingFee: boolean;
  paymentProcessingFeePercentage: number;
  fn: string;
}

export const parseSetFee = (data: Record<string, any> | undefined): SetFee => ({
  applyCalculatedVAT: data?.applyCalculatedVAT || false,
  fastTrackFeeAmount: data?.fastTrackFeeAmount,
  serviceChargeAmount: DEFAULT_SERVICE_CHARGE_AMOUNT,
  applyPaymentProcessingFee: data?.applyPaymentProcessingFee || false,
  paymentProcessingFeePercentage: DEFAULT_PAYMENT_PROCESSING_PERCENTAGE,
  fn: DEFAULT_FEE_KEYS["payable"],
  ...parseBaseNodeData(data),
});

export const DEFAULT_SERVICE_CHARGE_AMOUNT = 40; // £40
export const DEFAULT_PAYMENT_PROCESSING_PERCENTAGE = 0.01; // 1%
export const VAT_PERCENTAGE = 0.2; // 20%

// SetFee relies on a number of stable passport data values
export const DEFAULT_FEE_KEYS = {
  calculated: "application.fee.calculated", // exclusive of VAT; application fee after exemptions and reductions
  calculatedVAT: "application.fee.calculated.VAT",
  fastTrackOptIn: "fastTrack.optIn", // "true"
  fastTrackFee: "application.fee.fastTrack", // exclusive of VAT
  fastTrackFeeVAT: "application.fee.fastTrack.VAT",
  serviceCharge: "application.fee.serviceCharge", // exclusive of VAT
  serviceChargeVAT: "application.fee.serviceCharge.VAT",
  paymentProcessingFee: "application.fee.paymentProcessing", // exclusive of VAT
  paymentProcessingFeeVAT: "application.fee.paymentProcessing.VAT",
  payable: PAY_FN, // sum inclusive of VAT; passed to Pay component
  payableVAT: `${PAY_FN}.VAT`, // sum of `.VAT`
};
