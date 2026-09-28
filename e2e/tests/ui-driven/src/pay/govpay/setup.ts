import type { CoreDomainClient } from "@opensystemslab/planx-core";
import { gql } from "graphql-request";

import type { TestContext } from "../../helpers/types.js";

export async function setupGovPay(
  $admin: CoreDomainClient,
  context: TestContext,
) {
  try {
    await $admin.client.request(
      gql`
        mutation SetupGovPay($team_id: Int, $staging_govpay_secret: String) {
          update_team_integrations(
            where: { team_id: { _eq: $team_id } }
            _set: { staging_govpay_secret: $staging_govpay_secret }
          ) {
            affected_rows
          }
          update_team_settings(
            where: { team_id: { _eq: $team_id } }
            _set: { payment_provider: "govpay" }
          ) {
            affected_rows
          }
        }
      `,
      {
        team_id: context.team.id,
        staging_govpay_secret: process.env.GOV_UK_PAY_SECRET_E2E,
      },
    );
  } catch (error) {
    throw Error("Failed to setup GovPay for E2E team");
  }
}
