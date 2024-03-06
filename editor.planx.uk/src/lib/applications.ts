import gql from "graphql-tag";
import { client } from "lib/graphql";

export type ApplicationData = {
  session_id: string;
  submitted_at: Date | string;
  user_invited_to_pay: boolean;
  payment_status: string;
  amount: number;
  payment_date: Date | string;
  sent_to_email: boolean;
  sent_to_bops: boolean;
  sent_to_uniform: boolean;
};

export async function fetchSubmittedApplications(
  flowSlug: string,
  teamSlug: string,
) {
  const { data } = await client.query({
    query: gql`
      query SubmittedApplications($service_slug: String!, $team_slug: String!) {
        applications_summary(
          where: {
            service_slug: { _eq: $service_slug }
            team_slug: { _eq: $team_slug }
            submitted_at: { _is_null: false }
          }
          order_by: { submitted_at: desc }
        ) {
          session_id
          submitted_at
          user_invited_to_pay
          payment_status
          amount
          payment_date
          sent_to_email
          sent_to_bops
          sent_to_uniform
        }
      }
    `,
    variables: {
      service_slug: flowSlug,
      team_slug: teamSlug,
    },
  });
  return data;
}
