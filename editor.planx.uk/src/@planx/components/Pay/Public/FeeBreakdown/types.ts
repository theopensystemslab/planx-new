export interface FeeBreakdown {
  amount: {
    applicationFee: number;
    total: number;
    reduction: number;
    vat: number | undefined;
  };
  reductions: string[];
  exemptions: string[];
}

export interface PassportFeeFields {
  amount: {
    "application.fee.calculated": number;
    "application.fee.payable": number;
    "application.fee.payable.vat": number;
  },
  reductions?: Record<string, boolean>
  exemptions?: Record<string, boolean>
};