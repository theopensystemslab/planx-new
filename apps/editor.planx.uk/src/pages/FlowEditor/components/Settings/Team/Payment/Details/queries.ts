import { gql } from "@apollo/client";

export const GET_TEAM_INVOICE_DETAILS = gql`
  query GetInvoiceDetails($teamId: Int!) {
    teamInvoiceDetails: team_invoice_details(
      where: { team_id: { _eq: $teamId } }
    ) {
      id
      businessName: business_name
      emailAddress: email_address
      companyRegistration: company_registration
      vatNumber: vat_number
    }
  }
`;

export const UPDATE_TEAM_INVOICE_DETAILS = gql`
  mutation UpdateTeamInvoiceDetails(
    $teamId: Int!
    $teamInvoiceDetails: team_invoice_details_set_input
  ) {
    update_team_invoice_details(
      where: { team_id: { _eq: $teamId } }
      _set: $teamInvoiceDetails
    ) {
      returning {
        id
        businessName: business_name
        emailAddress: email_address
        companyRegistration: company_registration
        vatNumber: vat_number
      }
    }
  }
`;
