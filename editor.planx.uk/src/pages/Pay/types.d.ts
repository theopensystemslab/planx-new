export interface PaymentRequest {
  createdAt: string;
  sessionPreviewData: Record<string, any>;
  paymentRequestId: string;
  paymentAmount: number;
}
