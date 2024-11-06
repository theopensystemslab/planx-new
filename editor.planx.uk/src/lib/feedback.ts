import { gql } from "@apollo/client";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import Bowser from "bowser";
import { Sentiment } from "components/Feedback/MoreInfoFeedback/MoreInfoFeedback";
import { FeedbackView } from "components/Feedback/types";
import { Store, useStore } from "pages/FlowEditor/lib/store";

import { publicClient } from "./graphql";

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
  userComment: string;
  feedbackScore?: string;
  feedbackType: FeedbackView | Sentiment;
  nodeData?: Store.Node["data"];
}) {
  const result = await publicClient.mutate({
    mutation: gql`
      mutation InsertFeedback(
        $teamId: Int
        $flowId: uuid
        $nodeId: String
        $nodeType: String
        $device: jsonb
        $userData: jsonb
        $userContext: String
        $feedbackScore: String
        $userComment: String!
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
    variables: data,
  });

  return result.data.insert_feedback.affected_rows;
}
