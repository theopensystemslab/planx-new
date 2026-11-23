import { gql } from "@apollo/client";

export const GET_MULTIPLE_STRIPE_ACCOUNTS_SETTING = gql`
  query GetMultipleStripeAccountsSetting($slug: String!) {
    teams(where: { slug: { _eq: $slug } }, limit: 1) {
      id
      name
      settings: team_settings {
        id
        multipleStripeAccountsEnabled: multiple_stripe_accounts_enabled
      }
    }
    stripeAccounts: team_stripe_accounts(
      where: { team: { slug: { _eq: $slug } } }
    ) {
      id
      name
    }
  }
`;

export const UPDATE_MULTIPLE_STRIPE_ACCOUNTS_SETTING = gql`
  mutation UpdateMultipleStripeAccountsSetting(
    $teamId: Int!
    $settings: team_settings_set_input!
  ) {
    update_team_settings(
      where: { team_id: { _eq: $teamId } }
      _set: $settings
    ) {
      returning {
        id
        multipleStripeAccountsEnabled: multiple_stripe_accounts_enabled
      }
    }
  }
`;
