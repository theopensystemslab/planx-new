import { gql } from "@apollo/client";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import Bowser from "bowser";
import { Sentiment } from "components/Feedback/MoreInfoFeedback/MoreInfoFeedback";
import { FeedbackView } from "components/Feedback/types";
import { Store, useStore } from "pages/FlowEditor/lib/store";

import { client } from "./graphql";

type UserData = {
  breadcrumbs: Store.Breadcrumbs;
  passport: Store.Passport;
};

export type FeedbackMetadata = {
  teamId?: number;
  flowId?: string;
  nodeId?: string | null;
  nodeType?: string | null;
  device: Bowser.Parser.ParsedResult;
  userData: UserData;
  nodeData: Store.Node["data"];
};

export async function getInternalFeedbackMetadata(): Promise<FeedbackMetadata> {
  const {
    breadcrumbs,
    currentCard: node,
    computePassport,
    fetchCurrentTeam,
    id: flowId,
  } = useStore.getState();
  const { id: teamId } = await fetchCurrentTeam();
  const userData = {
    breadcrumbs: breadcrumbs,
    passport: computePassport(),
  };
  const metadata = {
    teamId,
    flowId,
    nodeId: node?.id,
    nodeType: node?.type ? TYPES[node.type] : null,
    device: Bowser.parse(window.navigator.userAgent),
    userData: userData,
    nodeData: node?.data,
  };

  return metadata;
}

export async function insertFeedbackMutation(data: {
  teamId?: number;
  flowId?: string;
  nodeId?: string | null;
  nodeType?: string | null;
  device?: Bowser.Parser.ParsedResult;
  userData?: UserData;
  userContext?: string;
  userComment?: string;
  feedbackScore?: number;
  feedbackType: FeedbackView | Sentiment;
  nodeData?: Store.Node["data"];
}) {
  const result = await client.mutate({
    mutation: gql`
      mutation InsertFeedback(
        $teamId: Int
        $flowId: uuid
        $nodeId: String
        $nodeType: String
        $device: jsonb
        $userData: jsonb
        $userContext: String
        $feedbackScore: Int
        $userComment: String
        $feedbackType: feedback_type_enum_enum!
        $nodeData: jsonb
      ) {
        insert_feedback(
          objects: {
            team_id: $teamId
            flow_id: $flowId
            node_id: $nodeId
            node_type: $nodeType
            device: $device
            user_data: $userData
            user_context: $userContext
            feedback_score: $feedbackScore
            user_comment: $userComment
            feedback_type: $feedbackType
            node_data: $nodeData
          }
        ) {
          affected_rows
        }
      }
    `,
    variables: {
      ...data,
      feedbackScore: data.feedbackScore || null,
      userComment: data.userComment || null,
    },
    context: { role: "public" },
  });

  return result.data.insert_feedback.affected_rows;
}

export const FEEDBACK_SUMMARY_FIELDS = gql`
  fragment FeedbackSummaryFields on feedback_summary {
    address
    createdAt: created_at
    feedbackScore: feedback_score
    flowName: service_name
    id: feedback_id
    nodeTitle: node_title
    nodeType: node_type
    type: feedback_type
    userComment: user_comment
    userContext: user_context
    platform: device(path: "platform.type")
    browser: device(path: "browser.name")
    helpDefinition: help_definition
    helpSources: help_sources
    helpText: help_text
    nodeData: node_data
    nodeId: node_id
    nodeText: node_text
    projectType: project_type
    editorNotes: editor_notes
    status: status
  }
`;
