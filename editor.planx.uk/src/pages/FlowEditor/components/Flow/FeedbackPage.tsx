import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import React from "react";
import { Feedback } from "routes/feedback";

interface Props {
  feedback: Feedback[];
}

const GET_FEEDBACK_BY_ID_QUERY = gql`
  query GetFeedbackById($feedbackId: Int!) {
    feedback: feedback_summary(where: { feedback_id: { _eq: $feedbackId } }) {
      address
      createdAt: created_at
      device
      feedbackId: feedback_id
      feedbackType: feedback_type
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

const getDetailedFeedback = async (feedbackId: number) => {
  const {
    data: {
      feedback: [detailedFeedback],
    },
  } = await client.query({
    query: GET_FEEDBACK_BY_ID_QUERY,
    variables: { feedbackId },
  });
  console.log(detailedFeedback);
};

export const FeedbackPage: React.FC<Props> = ({ feedback }) => {
  return (
    <Box sx={{ fontSize: 12, overflowY: "auto" }}>
      {feedback.map((item) => (
        <React.Fragment key={item.id}>
          <Box component="pre">{JSON.stringify(item, null, 4)}</Box>
          <Button onClick={() => getDetailedFeedback(item.id)}>
            Log out detailed info
          </Button>
        </React.Fragment>
      ))}
    </Box>
  );
};
