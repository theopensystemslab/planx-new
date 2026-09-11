export interface InvoiceDetailsFormValues {
  businessName: string;
  emailAddress: string;
  companyRegistration?: string;
  vatNumber: string;
}

export interface GetTeamInvoiceDetailsData {
  teamInvoiceDetails: InvoiceDetailsFormValues[];
}

export interface UpdateTeamInvoiceDetailsVariables {
  teamId: number;
  teamInvoiceDetails: {
    business_name: string;
    email_address: string;
    company_registration?: string;
    vat_number: string;
  };
}
