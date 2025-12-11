import type { SendIntegration, Team } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import type { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";
import type { CombinedResponse } from "../../../../lib/hasura/metadata/types.js";
import { createScheduledEvent } from "../../../../lib/hasura/metadata/index.js";
import { $api, $public } from "../../../../client/index.js";
import { getMostRecentPublishedFlow } from "../../../../helpers.js";
import type { Flow, Node } from "../../../../types.js";

// Create "One-off Scheduled Events" in Hasura when a payment request is paid
const createPaymentSendEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<NextFunction | Response | void> => {
  try {
    const { payload } = req.body;
    if (!payload.sessionId) {
      return next({
        status: 400,
        message: `Missing payload data to create payment send events`,
      });
    }

    const now = new Date();
    const combinedResponse: CombinedResponse = {};

    const session = await $api.session.find(payload.sessionId);
    if (!session) {
      return next({
        status: 400,
        message: `Cannot fetch session to create payment send events`,
      });
    }

    const publishedFlowData = await getMostRecentPublishedFlow(session.flow.id);
    if (!publishedFlowData) {
      return next({
        status: 400,
        message: `Cannot fetch flow data to create payment send events`,
      });
    }

    // Find this sessions Send component, determine which "destinations" we need to queue up events for
    //   REMINDER to keep these destinations in sync with apps/api.planx.uk/modules/send/createSendEvents/controller.ts
    const sendNode: [string, Node] | undefined = Object.entries(
      publishedFlowData,
    ).find(([_nodeId, nodeData]) => nodeData.type === ComponentType.Send);
    const destinations: SendIntegration[] = sendNode?.[1]?.data?.destinations;

    const teamSlug = await getTeamSlugByFlowId(session.flow.id);
    const eventPayload = { sessionId: payload.sessionId };

    if (destinations.includes("bops")) {
      const bopsEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/bops/${teamSlug}`,
        schedule_at: new Date(now.getTime() + 15 * 1000),
        payload: eventPayload,
        comment: `bops_submission_${payload.sessionId}`,
      });
      combinedResponse["bops"] = bopsEvent;
    }

    if (destinations.includes("email")) {
      const emailSubmissionEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/email-submission/${teamSlug}`,
        schedule_at: now,
        payload: eventPayload,
        comment: `email_submission_${payload.sessionId}`,
      });
      combinedResponse["email"] = emailSubmissionEvent;
    }

    if (destinations.includes("uniform")) {
      const uniformEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/uniform/${teamSlug}`,
        schedule_at: new Date(now.getTime() + 30 * 1000),
        payload: eventPayload,
        comment: `uniform_submission_${payload.sessionId}`,
      });
      combinedResponse["uniform"] = uniformEvent;
    }

    if (destinations.includes("s3")) {
      const s3Event = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/upload-submission/${teamSlug}`,
        schedule_at: now,
        payload: eventPayload,
        comment: `upload_submission_${payload.sessionId}`,
      });
      combinedResponse["s3"] = s3Event;
    }

    if (destinations.includes("fme")) {
      const fmeEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/upload-submission/${teamSlug}?notify=false`,
        schedule_at: new Date(now.getTime() + 15 * 1000),
        payload: eventPayload,
        comment: `upload_submission_without_notification_${payload.sessionId}`,
      });
      combinedResponse["fme"] = fmeEvent;
    }

    return res.json(combinedResponse);
  } catch (error) {
    return next({
      error,
      message: `Failed to create payment send event(s). Error: ${error}`,
    });
  }
};

interface GetTeamSlugByFlowId {
  flow: {
    team: {
      slug: string;
    };
  };
}

const getTeamSlugByFlowId = async (id: Flow["id"]): Promise<Team["slug"]> => {
  const data = await $public.client.request<GetTeamSlugByFlowId>(
    gql`
      query GetTeamSlugByFlowId($id: uuid!) {
        flow: flows_by_pk(id: $id) {
          team {
            slug
          }
        }
      }
    `,
    { id },
  );

  return data.flow.team.slug;
};

export { createPaymentSendEvents };
