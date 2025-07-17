export interface ServiceCharge {
  flowName: string;
  sessionId: string;
  paymentId: string;
  amount: number;
  paidAtTimestamp: string;
  paidAtDate: string;
  paidAtMonth: number;
  paidAtMonthText: string;
  paidAtQuarter: number;
  paidAtYear: number;
}
