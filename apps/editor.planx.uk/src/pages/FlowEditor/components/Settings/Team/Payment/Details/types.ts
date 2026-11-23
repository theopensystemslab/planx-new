export interface InvoiceDetailsFormValues {
  organisationName: string;
  emailAddress: string;
  companyRegistration?: string;
  vatNumber: string;
}

export interface GetTeamInvoiceDetailsData {
  teamInvoiceDetails: InvoiceDetailsFormValues[];
}

export type InvoiceDetailsTarget = { teamId: number } | { id: number };

export type UpdateTeamInvoiceDetailsVariables = InvoiceDetailsTarget & {
  teamInvoiceDetails: {
    organisation_name: string;
    email_address: string;
    company_registration?: string;
    vat_number: string;
  };
};
