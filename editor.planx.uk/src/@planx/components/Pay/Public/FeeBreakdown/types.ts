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
  "application.fee.calculated": number;
  "application.fee.payable": number;
  "application.fee.payable.vat": number;
  "application.fee.reduction.alternative": boolean;
  "application.fee.reduction.parishCouncil": boolean;
  "application.fee.reduction.sports": boolean;
  "application.fee.exemption.disability": boolean;
  "application.fee.exemption.resubmission": boolean;
};