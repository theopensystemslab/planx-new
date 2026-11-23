export interface InvoiceAddressFormValues {
  addressLine1: string;
  addressLine2?: string;
  townCity: string;
  county?: string;
  postcode: string;
}

export interface GetTeamInvoiceAddressData {
  teamInvoiceAddress: InvoiceAddressFormValues[];
}

export type InvoiceAddressTarget = { teamId: number } | { id: number };

export type UpdateTeamInvoiceAddressVariables = InvoiceAddressTarget & {
  teamInvoiceAddress: {
    address_line1: string;
    address_line2?: string;
    town_city: string;
    county?: string;
    postcode: string;
  };
};
