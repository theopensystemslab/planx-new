import { gql } from "@apollo/client";

export const GET_SUBMISSION_EVENTS = gql`
  query GetSubmissionEvents($sessionId: uuid!) {
    submissions: submission_services_log(
      where: { session_id: { _eq: $sessionId } }
      order_by: { created_at: desc }
    ) {
      flowId: flow_id
      sessionId: session_id
      eventId: event_id
      eventType: event_type
      status: status
      retry: retry
      response: response
      address: address
      createdAt: created_at
      flowName: flow_name
    }
  }
`;

export const GET_TEAM_LOGO = gql`
  query GetTeamLogo($teamSlug: String!) {
    teams(where: { slug: { _eq: $teamSlug } }) {
      theme {
        logo
        primaryColour: primary_colour
      }
      id
      name
    }
  }
`;
