import { gql } from "graphql-request";

export const CONSUME_MAGIC_LINK_MUTATION = gql`
  mutation ConsumeMagicLinkToken(
    $email: String!
    $token: uuid!
    $expiry: timestamptz!
  ) {
    updateMagicLinks: update_lps_magic_links(
      where: {
        _and: {
          # Find matching token...
          email: { _eq: $email }
          token: { _eq: $token }
          operation: { _eq: "login" }
          # ...which is active and unexpired
          used_at: { _is_null: true }
          created_at: { _gte: $expiry }
        }
      }
      # Consume token
      _set: { used_at: "now()" }
    ) {
      returning {
        applications: lowcal_sessions(
          where: { status: { _neq: "expired" } }
          order_by: { updated_at: asc }
        ) {
          id
          addressLine: data(path: "passport.data._address.single_line_address")
          addressTitle: data(path: "passport.data._address.title")
          status: user_status
          createdAt: created_at
          updatedAt: updated_at
          submittedAt: submitted_at
          sanitisedAt: sanitised_at
          service: flow {
            name
            slug
            team {
              name
              slug
              domain
            }
          }
        }
      }
    }
  }
`;
