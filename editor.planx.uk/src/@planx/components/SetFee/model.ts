import { PAY_FN } from "../Pay/model";
import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface SetFee extends BaseNodeData {
  applyCalculatedVAT: boolean;
  fastTrackFeeAmount?: number;
  applyServiceCharge: boolean;
  serviceChargeAmount: number;
  applyPaymentProcessingFee: boolean;
  paymentProcessingFeePercentage: number;
  fn: string;
}

export const parseSetFee = (data: Record<string, any> | undefined): SetFee => ({
  applyCalculatedVAT: data?.applyCalculatedVAT || false,
  fastTrackFeeAmount: data?.fastTrackFeeAmount,
  applyServiceCharge: data?.applyServiceCharge || false,
  serviceChargeAmount: DEFAULT_SERVICE_CHARGE_AMOUNT,
  applyPaymentProcessingFee: data?.applyPaymentProcessingFee || false,
  paymentProcessingFeePercentage: DEFAULT_PAYMENT_PROCESSING_PERCENTAGE,
  fn: PAY_FN,
  ...parseBaseNodeData(data),
});

export const DEFAULT_SERVICE_CHARGE_AMOUNT = 40; // £40
export const DEFAULT_PAYMENT_PROCESSING_PERCENTAGE = 0.01; // 1%
export const VAT_PERCENTAGE = 0.2; // 20%
