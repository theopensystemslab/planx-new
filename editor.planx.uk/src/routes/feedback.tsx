import type { Node } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { Sentiment } from "components/Feedback/MoreInfoFeedback/MoreInfoFeedback";
import { FeedbackCategory } from "components/Feedback/types";
import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData } from "navi";
import { FeedbackLog } from "pages/FlowEditor/components/Flow/FeedbackLog/FeedbackLog";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { client } from "../lib/graphql";
import { FEEDBACK_SUMMARY_FIELDS } from "./queryFragments";
import { makeTitle } from "./utils";

type FeedbackType = Sentiment & FeedbackCategory;

export interface Feedback {
  id: number;
  type: FeedbackType;
  nodeTitle: string | null;
  nodeType: keyof typeof ComponentType | null;
  userComment: string | null;
  userContext: string | null;
  createdAt: string;
  address: string | null;
  feedbackScore: number;
  flowName: string;
  platform: string;
  browser: string;
  helpDefinition: string | null;
  helpSources: string | null;
  helpText: string | null;
  nodeData: Node["data"] | null;
  nodeId: string | null;
  nodeText: string | null;
  projectType: string | null;
}

const feedbackRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": route(async (req) => {
      const { team: teamSlug } = req.params;

      const isAuthorised = useStore.getState().canUserEditTeam(teamSlug);
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      const {
        data: { feedback },
      } = await client.query<{ feedback: Feedback[] }>({
        query: gql`
          ${FEEDBACK_SUMMARY_FIELDS}

          query GetFeedbackForTeam($teamSlug: String!) {
            feedback: feedback_summary(
              order_by: { created_at: desc }
              where: { team_slug: { _eq: $teamSlug } }
            ) {
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
            }
          }
        `,
        variables: { teamSlug },
      });

      return {
        title: makeTitle("Team Feedback"),
        view: <FeedbackLog feedback={feedback} />,
      };
    }),
  }),
);

export default feedbackRoutes;
