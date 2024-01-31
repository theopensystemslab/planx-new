import { gql } from "@apollo/client";
import Bowser from "bowser";
import { Store, useStore } from "pages/FlowEditor/lib/store";

import { publicClient } from "./graphql";

export const submitFeedback = (
  text: string,
  reason: string,
  componentMetadata?: { [key: string]: any },
) => {
  const standardMetadata = getFeedbackMetadata();
  fetch("https://api.feedback.fish/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: process.env.REACT_APP_FEEDBACK_FISH_ID,
      text,
      reason,
      // FeedbackFish requires that Record<string, string> be passed as metadata
      metadata: {
        ...standardMetadata,
        "component-metadata": JSON.stringify(componentMetadata),
      },
    }),
  }).catch((err) => console.error(err));
};

export const getFeedbackMetadata = (): Record<string, string> => {
  const { currentCard, computePassport, breadcrumbs } = useStore.getState();

  const passportData = computePassport().data;
  const nodeData = currentCard()?.data;

  const [team, service] = window.location.pathname
    .split("/")
    .map((value) => value.replaceAll("-", " "))
    .slice(1, 3);

  const feedbackMetadata = {
    address:
      passportData?._address?.single_line_address ||
      passportData?._address?.title,
    uprn: passportData?._address?.uprn,
    "project-type": passportData?.proposal?.projectType,
    title: nodeData?.title || nodeData?.text,
    data: JSON.stringify(nodeData),
    breadcrumbs: JSON.stringify(breadcrumbs),
    service,
    team,
  };
  return feedbackMetadata;
};

export type FeedbackMetadata = {
  teamId?: number;
  flowId?: string;
  nodeId?: string | null;
  projectType?: string;
  address?: string;
  device: Bowser.Parser.ParsedResult;
  breadcrumbs: Store.breadcrumbs;
  componentMetadata: { [key: string]: any };
};

export async function getInternalFeedbackMetadata(
  componentMetadata = {},
): Promise<FeedbackMetadata> {
  const {
    breadcrumbs,
    currentCard,
    computePassport,
    fetchCurrentTeam,
    id: flowId,
  } = useStore.getState();
  const { data: passportData } = computePassport();
  const { id: teamId } = await fetchCurrentTeam();
  const node = currentCard();
  const projectType = passportData?.["proposal.projectType"]?.[0];
  const metadata = {
    teamId,
    flowId,
    nodeId: node?.id,
    projectType: projectType,
    address:
      passportData?._address?.single_line_address ||
      passportData?._address?.title,
    device: Bowser.parse(window.navigator.userAgent),
    breadcrumbs: breadcrumbs,
    componentMetadata,
  };

  return metadata;
}

export async function insertFeedbackMutation(data: {
  teamId?: number;
  flowId?: string;
  nodeId?: string | null;
  projectType?: string;
  address?: string;
  device?: Bowser.Parser.ParsedResult;
  breadcrumbs?: Store.breadcrumbs;
  componentMetadata?: { [key: string]: any };
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
        $projectType: String
        $address: String
        $device: jsonb
        $breadcrumbs: jsonb
        $componentMetadata: jsonb
        $userContext: String
        $userComment: String!
        $feedbackType: feedback_type_enum_enum!
      ) {
        insert_feedback(
          objects: {
            team_id: $teamId
            flow_id: $flowId
            node_id: $nodeId
            project_type: $projectType
            address: $address
            device: $device
            breadcrumbs: $breadcrumbs
            component_metadata: $componentMetadata
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
