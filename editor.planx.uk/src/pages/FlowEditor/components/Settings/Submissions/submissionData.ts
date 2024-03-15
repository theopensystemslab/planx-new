import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";

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
  id: number;
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

export type SubmittedApplicationsQueryResult = {
  submissionServicesSummary: SubmissionData[];
};

export const SUBMITTED_APPLICATIONS_QUERY = gql`
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
`;

type UseSubmittedApplicationsParams = {
  flowSlug?: string;
  teamSlug?: string;
};

export const useSubmittedApplications = ({
  flowSlug,
  teamSlug,
}: UseSubmittedApplicationsParams) => {
  const { data, loading, error } = useQuery<SubmittedApplicationsQueryResult>(
    SUBMITTED_APPLICATIONS_QUERY,
    {
      variables: { service_slug: flowSlug, team_slug: teamSlug },
      skip: !flowSlug || !teamSlug,
    },
  );

  const applications = useMemo(
    () => data?.submissionServicesSummary || [],
    [data],
  );

  return { applications, loading, error };
};
