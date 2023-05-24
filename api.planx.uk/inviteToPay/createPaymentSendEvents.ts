import { ComponentType } from '@opensystemslab/planx-core/types';
import { NextFunction, Request, Response } from 'express';
import { gql } from 'graphql-request';
import { _admin as $admin } from '../client';
import { adminGraphQLClient as adminClient } from "../hasura";
import { createScheduledEvent } from "../hasura/metadata";
import { getMostRecentPublishedFlow } from '../helpers';
import { Flow, Node, Team } from '../types';

enum Destination {
  BOPS = "bops",
  Uniform = "uniform",
  Email = "email",
}

interface CombinedResponse {
  bops?: Record<string, string>;
  uniform?: Record<string, string>;
  email?: Record<string, string>;
}

// Create "One-off Scheduled Events" in Hasura when a payment request is paid
const createPaymentSendEvents = async (req: Request, res: Response, next: NextFunction): 
  Promise<NextFunction | Response | void> => {
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

    const session = await $admin.getSessionById(payload.sessionId);
    const publishedFlowData = await getMostRecentPublishedFlow(session.flowId);
    if (!session || !publishedFlowData) {
      return next({
        status: 400,
        message: `Cannot fetch session or flow data to create payment send events`,
      });
    }

    // Find this sessions Send component, determine which "destinations" we need to queue up events for
    const sendNode: [string, Node] | undefined = Object.entries(publishedFlowData).find(([_nodeId, nodeData]) => nodeData.type === ComponentType.Send);
    const destinations: Destination[] = sendNode?.[1]?.data?.destinations;

    let teamSlug = await getTeamSlugByFlowId(session.flowId);
    const eventPayload = { sessionId: payload.sessionId };

    if (destinations.includes(Destination.BOPS)) {
      const bopsEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/bops/${teamSlug}`,
        schedule_at: now,
        payload: eventPayload,
        comment: `bops_submission_${payload.sessionId}`,
      });
      combinedResponse[Destination.BOPS] = bopsEvent;
    }

    if (destinations.includes(Destination.Uniform)) {
      // Bucks has 3 instances of Uniform for 4 legacy councils, set teamSlug to pre-merger council name
      if (teamSlug === "buckinghamshire") {
        teamSlug = session.data?.passport?.data?.["property.localAuthorityDistrict"]
          ?.filter((name: string) => name !== "Buckinghamshire")[0]
          ?.toLowerCase()
          ?.replace(/\W+/g, "-");

        // South Bucks & Chiltern share an Idox connector, route addresses in either to Chiltern
        if (teamSlug === "south-bucks") {
          teamSlug = "chiltern";
        }
      }

      const uniformEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/uniform/${teamSlug}`,
        schedule_at: now,
        payload: eventPayload,
        comment: `uniform_submission_${payload.sessionId}`,
      });
      combinedResponse[Destination.Uniform] = uniformEvent;
    }

    if (destinations.includes(Destination.Email)) {
      const emailSubmissionEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/email-submission/${teamSlug}`,
        schedule_at: now,
        payload: eventPayload,
        comment: `email_submission_${payload.sessionId}`,
      });
      combinedResponse[Destination.Email] = emailSubmissionEvent;
    }

    return res.json(combinedResponse);
  } catch (error) {
    return next({
      error,
      message: `Failed to create payment send event(s). Error: ${error}`,
    });
  }
};

const getTeamSlugByFlowId = async (id: Flow["id"]): Promise<Team["slug"]> => {
  const data = await adminClient.request(
    gql`
      query GetFlowData($id: uuid!) {
        flows_by_pk(id: $id) {
          team {
            slug
          }
        }
      }
    `,
    { id }
  );

  return data.flows_by_pk.team.slug;
};

export { createPaymentSendEvents };
