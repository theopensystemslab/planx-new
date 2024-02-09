import { gql } from "@apollo/client";
import { TYPES } from "@planx/components/types";
import Bowser from "bowser";
import { Store, useStore } from "pages/FlowEditor/lib/store";

import { publicClient } from "./graphql";

type UserData = {
  breadcrumbs: Store.breadcrumbs;
  passport: Store.passport;
};

export type FeedbackMetadata = {
  teamId?: number;
  flowId?: string;
  nodeId?: string | null;
  nodeType?: string | null;
  device: Bowser.Parser.ParsedResult;
  userData: UserData;
};

export async function getInternalFeedbackMetadata(): Promise<FeedbackMetadata> {
  const {
    breadcrumbs,
    currentCard,
    computePassport,
    fetchCurrentTeam,
    id: flowId,
  } = useStore.getState();
  const { id: teamId } = await fetchCurrentTeam();
  const node = currentCard();
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
  feedbackType: string;
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
        $userComment: String!
        $feedbackType: feedback_type_enum_enum!
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
            user_comment: $userComment
            feedback_type: $feedbackType
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
