import gql from "graphql-tag";

export const GET_FEEDBACK_BY_ID_QUERY = gql`
  query GetFeedbackById($feedbackId: Int!) {
    feedback: feedback_summary(where: { feedback_id: { _eq: $feedbackId } }) {
      address
      createdAt: created_at
      platform: device(path: "platform.type")
      browser: device(path: "browser.name")
      feedbackId: feedback_id
      type: feedback_type
      helpDefinition: help_definition
      helpSources: help_sources
      helpText: help_text
      intersectingConstraints: intersecting_constraints
      nodeData: node_data
      nodeId: node_id
      nodeText: node_text
      nodeTitle: node_title
      nodeType: node_type
      projectType: project_type
      serviceSlug: service_slug
      teamSlug: team_slug
      status
      uprn
      userComment: user_comment
      userContext: user_context
    }
  }
`;
