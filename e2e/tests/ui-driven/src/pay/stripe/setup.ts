import assert from "node:assert";

import type { CoreDomainClient } from "@opensystemslab/planx-core";
import { gql } from "graphql-request";

import type { TestContext } from "../../helpers/types.js";

export async function setupStripe(
  $admin: CoreDomainClient,
  context: TestContext,
) {
  assert(
    process.env.STRIPE_CONNECT_ACCOUNT_ID_E2E,
    "STRIPE_CONNECT_ACCOUNT_ID_E2E must be set",
  );

  try {
    await $admin.client.request(
      gql`
        mutation SetupStripe($team_id: Int, $stripe_account_id: String) {
          insert_team_stripe_accounts_one(
            object: {
              team_id: $team_id
              staging_stripe_account_id: $stripe_account_id
            }
            on_conflict: {
              constraint: team_stripe_accounts_team_id_name_key
              update_columns: [staging_stripe_account_id]
            }
          ) {
            id
          }
          update_team_settings(
            where: { team_id: { _eq: $team_id } }
            _set: { payment_provider: "stripe" }
          ) {
            affected_rows
          }
        }
      `,
      {
        team_id: context.team.id,
        stripe_account_id: process.env.STRIPE_CONNECT_ACCOUNT_ID_E2E,
      },
    );
  } catch {
    throw Error("Failed to setup Stripe for E2E team");
  }
}
