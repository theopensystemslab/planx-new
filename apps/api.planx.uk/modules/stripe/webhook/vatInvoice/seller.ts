import { gql } from "graphql-request";

import { $api } from "../../../../client/index.js";
import type { VatInvoiceBranding, VatInvoiceSeller } from "./types.js";

/**
 * TODO: Confirm OSL registered details
 */
export const PLANX_SELLER: VatInvoiceSeller = {
  name: "Open Systems Lab",
  addressLines: [],
  vatNumber: null,
  companyRegistration: null,
  email: null,
};

interface GetCouncilInvoiceDetailsResponse {
  teams: {
    name: string;
    invoiceDetails: {
      organisationName: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      townCity: string | null;
      county: string | null;
      postcode: string | null;
      vatNumber: string | null;
      companyRegistration: string | null;
      emailAddress: string | null;
    } | null;
    theme: VatInvoiceBranding | null;
  }[];
}

/**
 * Fetch the details a council has configured to appear on invoices PlanX issues on their behalf
 *
 * Returns null if the council has not configured any invoice details
 */
export async function getCouncilInvoiceDetails(teamSlug: string): Promise<{
  seller: VatInvoiceSeller;
  branding: VatInvoiceBranding | null;
} | null> {
  const {
    teams: [team],
  } = await $api.client.request<GetCouncilInvoiceDetailsResponse>(
    gql`
      query GetCouncilInvoiceDetails($teamSlug: String!) {
        teams(where: { slug: { _eq: $teamSlug } }) {
          name
          invoiceDetails: invoice_details {
            organisationName: organisation_name
            addressLine1: address_line1
            addressLine2: address_line2
            townCity: town_city
            county
            postcode
            vatNumber: vat_number
            companyRegistration: company_registration
            emailAddress: email_address
          }
          theme {
            logo
            primaryColour: primary_colour
          }
        }
      }
    `,
    { teamSlug },
  );

  if (!team?.invoiceDetails) return null;

  const { invoiceDetails: details, theme } = team;

  return {
    seller: {
      name: details.organisationName || team.name,
      addressLines: [
        details.addressLine1,
        details.addressLine2,
        details.townCity,
        details.county,
        details.postcode,
      ].filter((line): line is string => Boolean(line)),
      vatNumber: details.vatNumber,
      companyRegistration: details.companyRegistration,
      email: details.emailAddress,
    },
    branding: theme,
  };
}
