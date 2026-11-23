import { gql } from "@apollo/client";

export const GET_TEAM_INVOICE_DETAILS = gql`
  query GetInvoiceDetails($teamId: Int!) {
    teamInvoiceDetails: team_invoice_details(
      where: { team_id: { _eq: $teamId } }
    ) {
      id
      organisationName: organisation_name
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
        organisationName: organisation_name
        emailAddress: email_address
        companyRegistration: company_registration
        vatNumber: vat_number
      }
    }
  }
`;

export const GET_INVOICE_DETAILS_BY_ID = gql`
  query GetInvoiceDetailsById($id: Int!) {
    teamInvoiceDetails: team_invoice_details(where: { id: { _eq: $id } }) {
      id
      organisationName: organisation_name
      emailAddress: email_address
      companyRegistration: company_registration
      vatNumber: vat_number
    }
  }
`;

export const UPDATE_INVOICE_DETAILS_BY_ID = gql`
  mutation UpdateInvoiceDetailsById(
    $id: Int!
    $teamInvoiceDetails: team_invoice_details_set_input
  ) {
    update_team_invoice_details(
      where: { id: { _eq: $id } }
      _set: $teamInvoiceDetails
    ) {
      returning {
        id
        organisationName: organisation_name
        emailAddress: email_address
        companyRegistration: company_registration
        vatNumber: vat_number
      }
    }
  }
`;
