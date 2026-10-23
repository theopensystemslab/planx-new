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

/**
 * Placeholder PlanX wordmark - TODO replace with real logo
 */
const PLANX_LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAyCAYAAACXpx/YAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAqFJREFUeNrsmoFtozAUht0qAzACtwEjcBMkN0Fhg3aDdIKqE5CbILcB2YB2gqQTwAYtqA+d9WRsMGDsu/+TrCbBGOzPftimQgAAAAAAAAAAAAAAAAAAAMzgbsGy4jZlhjw3Sm9tajT5MiqvP+cEVduTtulzQjq3KRkoq5TylWhae+43vPahTdWIUe8zEdWhmFlOsUAZSnYrVn4oDKeKynVh+BKg4JKiUB+Jcku5cifPfa0sD9GpptefWd4y0BBdsHoUjs/3UrBK4qc0qbIVnGie6VMni6kDSUHJtRGcafKPEdxFgmObrooJ3JWORQPn8utG1MA1O1bRXGFpWcHJtRHM82cTBCcKGapUDUiW8/STPV052YKSg5S7hODDSMGxQm5N+UrFsdIg+Gr4rnqE2EoOVq6N4KNliOYTtEdF6C4NclQjPWWdiI/ql5nP1qDlThXMQ2w9YRadUeNUmkZPDCGWj/544BlfW87mC0NUCE7uWMExNXZtGB1LLJPk8o+aY8VIUfXMJdAmctfc6BgrptsQeV7gegmNuu7vfsJ5HyOPRRPvJ6dOLkeHm+uNjN3Go77bvfol9C8edMusPQmNhX8UivuK6ff8XxZ8o1H7u01/LEdqsdCmxppyM1bnWOqYwpXkNQX/FOvsL3O5DV3nXfx9HXmh550Pck8kU/7dmeSdCIuUye0a78kyxLuUK8t0Kvk+QMEyQ3Jjz+TKE6+TYskHwVI4HsOLh3I3kRya4ItCZMSWMl1jHTyV61xyaILfKMkN0+9DV/Q581yuU8mhCe4bpjFMvrb4r4iTxXW5ZK9n0Q0Loc3Mkar63H//Ib5fMjywCVW3rn6l+3hg69ChUH8zrNkvBkFzO1W+cccEAAAAAAAAAAAAAAAAAAAA/y1fAgwArulzMLC30j4AAAAASUVORK5CYII=";

export const PLANX_BRANDING: VatInvoiceBranding = {
  logo: PLANX_LOGO,
  primaryColour: null,
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
