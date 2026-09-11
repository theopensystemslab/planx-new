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

export interface UpdateTeamInvoiceAddressVariables {
  teamId: number;
  teamInvoiceAddress: {
    address_line1: string;
    address_line2?: string;
    town_city: string;
    county?: string;
    postcode: string;
  };
}
