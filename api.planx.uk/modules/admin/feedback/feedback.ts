import type { Breadcrumbs, Node, Team } from "@opensystemslab/planx-core/types";
import type { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import type { Flow, Passport } from "../../../types.js";

/**
 * @swagger
 * /admin/feedback/{feedbackId}:
 *  get:
 *    summary: Returns a feedback entry with user data
 *    description: Returns a feedback entry plus its' associated session user data, including the passport and breadcrumbs
 *    tags:
 *      - admin
 *    parameters:
 *      - in: path
 *        name: feedbackId
 *        type: string
 *        required: true
 *    security:
 *      - bearerAuth: []
 */
export const getFeedbackWithUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const feedbackId = parseInt(req.params.feedbackId);
    const feedback = await getFeedbackById(feedbackId);
    if (feedback) {
      res.send(feedback);
    } else {
      res.send({
        message: `Cannot find feedback record ${feedbackId}; double-check your feedbackId is correct`,
      });
    }
  } catch (error) {
    return next({
      message:
        "Failed to fetch feedback admin data: " + (error as Error).message,
    });
  }
};

interface FeedbackResponse {
  feedback: {
    id: number;
    flow: {
      slug: Flow["slug"];
    };
    team: {
      slug: Team["slug"];
    };
    createdAt: string;
    feedbackType: string;
    feedbackScore: string;
    feedbackStatus: string;
    userDevice: Record<string, string>;
    userContext: string;
    userComment: string;
    userBreadcrumb: Breadcrumbs;
    userPassport: Passport["data"];
    nodeId: Node["id"];
    nodeType: Node["type"];
    nodeData: Node["data"];
  };
}

const getFeedbackById = async (
  feedbackId: number,
): Promise<FeedbackResponse | null> => {
  const { feedback } = await $api.client.request<
    Record<"feedback", FeedbackResponse | null>
  >(
    gql`
      query GetFeedback($feedbackId: Int!) {
        feedback: feedback_by_pk(id: $feedbackId) {
          id
          flow {
            slug
          }
          team {
            slug
          }
          createdAt: created_at
          feedbackType: feedback_type
          feedbackScore: feedback_score
          feedbackStatus: status
          userDevice: device
          userContext: user_context
          userComment: user_comment
          userBreadcrumbs: user_data(path: "breadcrumbs")
          userPassport: user_data(path: "passport.data")
          nodeId: node_id
          nodeType: node_type
          nodeData: node_data
        }
      }
    `,
    {
      feedbackId,
    },
  );

  return feedback;
};
