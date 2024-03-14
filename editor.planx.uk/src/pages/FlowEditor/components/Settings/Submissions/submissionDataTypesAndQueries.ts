import gql from "graphql-tag";
import { client } from "lib/graphql";

type PaymentRequest = {
  id: string;
  createdAt: string;
  paidAt: string;
  govPaymentId: string;
};

type PaymentStatus = {
  govPaymentId: string;
  createdAt: string;
  status: string;
};

type BopsApplication = {
  id: string;
  submittedAt: string;
  destinationUrl: string;
};

type EmailApplication = {
  id: string;
  recipient: string;
  submittedAt: string;
};

type UniformApplication = {
  id: string;
  submittedAt: string;
};

export type SubmissionData = {
  sessionId: string;
  submittedAt: Date | string;
  paymentRequests: PaymentRequest[] | null;
  paymentStatus: PaymentStatus[] | null;
  bopsApplications: BopsApplication[] | null;
  uniformApplications: UniformApplication[] | null;
  emailApplications: EmailApplication[] | null;
};

export async function fetchSubmittedApplications(
  flowSlug: string,
  teamSlug: string,
): Promise<SubmissionData[]> {
  const { data } = await client.query({
    query: gql`
      query SubmittedApplications($service_slug: String!, $team_slug: String!) {
        submissionServicesSummary: submission_services_summary(
          where: {
            service_slug: { _eq: $service_slug }
            team_slug: { _eq: $team_slug }
            submitted_at: { _is_null: false }
          }
          order_by: { submitted_at: desc }
        ) {
          sessionId: session_id
          submittedAt: submitted_at
          paymentRequests: payment_requests
          paymentStatus: payment_status
          bopsApplications: bops_applications
          uniformApplications: uniform_applications
          emailApplications: email_applications
        }
      }
    `,
    variables: {
      service_slug: flowSlug,
      team_slug: teamSlug,
    },
  });
  return data.submissionServicesSummary;
}
