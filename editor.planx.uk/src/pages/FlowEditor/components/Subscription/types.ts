export interface ServiceCharge {
  flowName: string;
  sessionId: string;
  paymentId: string;
  amount: number;
  paidAt: string; // timestamp
  month: number;
  monthText: string;
  quarter: number;
  fiscalYear: number;
}

export interface SubscriptionProps {
  serviceCharges: ServiceCharge[];
}
