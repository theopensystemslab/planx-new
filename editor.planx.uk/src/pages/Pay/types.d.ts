export interface PaymentRequest {
  createdAt: string;
  sessionPreviewData: Record<string, string>;
  paymentRequestId: string;
  paymentAmount: number;
}
