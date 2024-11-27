export interface FeeBreakdown {
  applicationFee: number;
  total: number;
  reduction: number;
  vat: number | undefined;
}

export interface PassportFeeFields {
  "application.fee.calculated": number;
  "application.fee.payable": number;
  "application.fee.payable.vat": number;
}
