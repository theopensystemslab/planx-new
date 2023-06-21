import { ComponentType } from "@opensystemslab/planx-core/types";
import { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";
import { $admin } from "../client";
import { adminGraphQLClient as adminClient } from "../hasura";
import { getMostRecentPublishedFlow } from "../helpers";
import { Flow, Node, Team } from "../types";
import { queueSubmissions } from "../send/queue";

enum Destination {
  BOPS = "bops",
  Uniform = "uniform",
  Email = "email",
}

// Hasura webhook for when a payment request is paid
export async function requestedPaymentReceived(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<NextFunction | Response | void> {
  try {
    const { payload } = req.body;
    if (!payload.sessionId) {
      return next({
        status: 400,
        message: `Missing payload data to create payment send events`,
      });
    }
    const sessionId = payload.sessionId;
    const session = await $admin.getSessionById(sessionId);
    const publishedFlowData = await getMostRecentPublishedFlow(session.flowId);
    if (!session || !publishedFlowData) {
      return next({
        status: 400,
        message: `Cannot fetch session or flow data to create payment send events`,
      });
    }

    // Find this sessions Send component, determine which "destinations" we need to queue up events for
    const sendNode: [string, Node] | undefined = Object.entries(
      publishedFlowData
    ).find(([_nodeId, nodeData]) => nodeData.type === ComponentType.Send);
    const destinations: Destination[] = sendNode?.[1]?.data?.destinations;

    let teamSlug = await getTeamSlugByFlowId(session.flowId);

    const getLocalAuthority = (teamSlug: string) => {
      // allow e2e team to present as "lambeth"
      return teamSlug == "e2e" ? "lambeth" : teamSlug;
    };

    const sendPayload: {
      [destination: string]: { localAuthority: string };
    } = {};

    if (destinations.includes(Destination.BOPS)) {
      sendPayload.bops = { localAuthority: getLocalAuthority(teamSlug) };
    }

    if (destinations.includes(Destination.Email)) {
      sendPayload.email = { localAuthority: getLocalAuthority(teamSlug) };
    }

    if (destinations.includes(Destination.Uniform)) {
      // Bucks has 3 instances of Uniform for 4 legacy councils, set teamSlug to pre-merger council name
      if (teamSlug === "buckinghamshire") {
        teamSlug = session.data?.passport?.data?.[
          "property.localAuthorityDistrict"
        ]
          ?.filter((name: string) => name !== "Buckinghamshire")[0]
          ?.toLowerCase()
          ?.replace(/\W+/g, "-");

        // South Bucks & Chiltern share an Idox connector, route addresses in either to Chiltern
        if (teamSlug === "south-bucks") {
          teamSlug = "chiltern";
        }
      }
      sendPayload.uniform = { localAuthority: getLocalAuthority(teamSlug) };
    }

    const responses = await queueSubmissions(sessionId, sendPayload);

    return res.json(responses);
  } catch (error) {
    return next({
      error,
      message: `Failed to queue submissions for sending. Error: ${error}`,
    });
  }
}

const getTeamSlugByFlowId = async (id: Flow["id"]): Promise<Team["slug"]> => {
  const data = await adminClient.request(
    gql`
      query GetTeamSlugByFlowId($id: uuid!) {
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
