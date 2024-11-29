export interface FeeBreakdown {
  amount: {
    applicationFee: number;
    total: number;
    reduction: number;
    vat: number | undefined;
  };
}

export interface PassportFeeFields {
  amount: {
    "application.fee.calculated": number;
    "application.fee.payable": number;
    "application.fee.payable.vat": number;
  },
};