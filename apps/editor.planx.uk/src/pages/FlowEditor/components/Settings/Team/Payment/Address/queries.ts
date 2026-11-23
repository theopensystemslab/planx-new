import { gql } from "@apollo/client";

export const GET_TEAM_INVOICE_ADDRESS = gql`
  query GetInvoiceAddress($teamId: Int!) {
    teamInvoiceAddress: team_invoice_details(
      where: { team_id: { _eq: $teamId } }
    ) {
      id
      addressLine1: address_line1
      addressLine2: address_line2
      county
      townCity: town_city
      postcode
    }
  }
`;

export const UPDATE_TEAM_INVOICE_ADDRESS = gql`
  mutation UpdateTeamInvoiceAddress(
    $teamId: Int!
    $teamInvoiceAddress: team_invoice_details_set_input!
  ) {
    update_team_invoice_details(
      where: { team_id: { _eq: $teamId } }
      _set: $teamInvoiceAddress
    ) {
      returning {
        id
        addressLine1: address_line1
        addressLine2: address_line2
        townCity: town_city
        county
        postcode
      }
    }
  }
`;

export const GET_INVOICE_ADDRESS_BY_ID = gql`
  query GetInvoiceAddressById($id: Int!) {
    teamInvoiceAddress: team_invoice_details(where: { id: { _eq: $id } }) {
      id
      addressLine1: address_line1
      addressLine2: address_line2
      county
      townCity: town_city
      postcode
    }
  }
`;

export const UPDATE_INVOICE_ADDRESS_BY_ID = gql`
  mutation UpdateInvoiceAddressById(
    $id: Int!
    $teamInvoiceAddress: team_invoice_details_set_input!
  ) {
    update_team_invoice_details(
      where: { id: { _eq: $id } }
      _set: $teamInvoiceAddress
    ) {
      returning {
        id
        addressLine1: address_line1
        addressLine2: address_line2
        townCity: town_city
        county
        postcode
      }
    }
  }
`;
