import { gql } from "graphql-request";

import { $api } from "../../../../client/index.js";
import { stripeAccountIdColumn } from "../../connect/service.js";
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

interface InvoiceDetails {
  organisationName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  townCity: string | null;
  county: string | null;
  postcode: string | null;
  vatNumber: string | null;
  companyRegistration: string | null;
  emailAddress: string | null;
}

const INVOICE_DETAILS_FIELDS = `
  organisationName: organisation_name
  addressLine1: address_line1
  addressLine2: address_line2
  townCity: town_city
  county
  postcode
  vatNumber: vat_number
  companyRegistration: company_registration
  emailAddress: email_address
`;

export interface NamedStripeAccount {
  name: string;
  invoiceDetails: InvoiceDetails | null;
}

/**
 * The team's account a payment was made to - in case of team having multiple stripe accounts
 */
export async function getNamedStripeAccount(
  teamSlug: string,
  stripeAccountId: string | null,
): Promise<NamedStripeAccount | null> {
  if (!stripeAccountId) return null;

  const column = stripeAccountIdColumn();

  const {
    stripeAccounts: [account],
  } = await $api.client.request<{
    stripeAccounts: (NamedStripeAccount & { team: { name: string } })[];
  }>(
    gql`
      query GetNamedStripeAccount($teamSlug: String!, $stripeAccountId: String!) {
        stripeAccounts: team_stripe_accounts(
          where: {
            team: { slug: { _eq: $teamSlug } }
            ${column}: { _eq: $stripeAccountId }
          }
        ) {
          name
          team {
            name
          }
          invoiceDetails: invoice_details {
            ${INVOICE_DETAILS_FIELDS}
          }
        }
      }
    `,
    { teamSlug, stripeAccountId },
  );

  if (!account || account.name === account.team.name) return null;

  return { name: account.name, invoiceDetails: account.invoiceDetails };
}

interface GetCouncilInvoiceDetailsResponse {
  teams: {
    id: number;
    name: string;
    invoiceDetails: InvoiceDetails | null;
    theme: VatInvoiceBranding | null;
  }[];
}

export interface CouncilInvoiceDetails {
  teamId: number;
  seller: VatInvoiceSeller;
  branding: VatInvoiceBranding | null;
  hasInvoiceDetails: boolean;
}

/**
 * Fetch the details a council has configured to appear on invoices - as the seller to the payer, and as the customer of OSL
 *
 * Uses either the team-level invoice details or the account-level invoice details if they multiple stripe accounts
 */
export async function getCouncilInvoiceDetails(
  teamSlug: string,
  stripeAccountId: string | null,
): Promise<CouncilInvoiceDetails> {
  const [
    {
      teams: [team],
    },
    namedAccount,
  ] = await Promise.all([
    $api.client.request<GetCouncilInvoiceDetailsResponse>(
      gql`
        query GetCouncilInvoiceDetails($teamSlug: String!) {
          teams(where: { slug: { _eq: $teamSlug } }) {
            id
            name
            invoiceDetails: invoice_details {
              ${INVOICE_DETAILS_FIELDS}
            }
            theme {
              logo
              primaryColour: primary_colour
            }
          }
        }
      `,
      { teamSlug },
    ),
    getNamedStripeAccount(teamSlug, stripeAccountId),
  ]);

  const { theme } = team;
  const details = namedAccount
    ? namedAccount.invoiceDetails
    : team.invoiceDetails;
  const name = namedAccount?.name ?? team.name;

  if (!details) {
    return {
      teamId: team.id,
      seller: {
        name,
        addressLines: [],
        vatNumber: null,
        companyRegistration: null,
        email: null,
      },
      branding: theme,
      hasInvoiceDetails: false,
    };
  }

  return {
    teamId: team.id,
    seller: {
      name: details.organisationName || name,
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
    hasInvoiceDetails: true,
  };
}
