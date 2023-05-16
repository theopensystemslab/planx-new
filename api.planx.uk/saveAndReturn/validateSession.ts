import { gql } from "graphql-request";
import { NextFunction, Request, Response } from "express";
import {
  adminGraphQLClient as adminClient,
  publicGraphQLClient as publicClient,
} from "../hasura";
import { getSaveAndReturnPublicHeaders } from "./utils";
import { getMostRecentPublishedFlow } from "../helpers";
import { sortBreadcrumbs } from "@opensystemslab/planx-core";
import { ComponentType } from "@opensystemslab/planx-core/types";
import type {
  NormalizedCrumb,
  OrderedBreadcrumbs,
  FlowGraph,
} from "@opensystemslab/planx-core/types";
import type { LowCalSession, PublishedFlow, Node } from "../types";

export interface ValidationResponse {
  message: string;
  changesFound: boolean | null;
  alteredSectionIds?: Array<string>;
  reconciledSessionData: LowCalSession["data"];
}

export type ReconciledSession = {
  alteredSectionIds: Array<string>;
  reconciledSessionData: LowCalSession["data"];
};

// TODO - Ensure reconciliation handles:
//  * collected flags
//  * auto-answered
//  * component dependencies like FindProperty, DrawBoundary, PlanningConstraints
export async function validateSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, sessionId } = req.body.payload;

    if (!email || !sessionId) {
      return next({
        status: 400,
        message: "Required value missing",
      });
    }

    const fetchedSession = await findSession({
      sessionId,
      email: email.toLowerCase(),
    });
    if (!fetchedSession) {
      return next({
        status: 404,
        message: "Unable to find your session",
      });
    }
    const sessionData = fetchedSession.data!;
    const sessionUpdatedAt = fetchedSession.updated_at!;
    const flowId = fetchedSession.flow_id!;

    // if a user has paid, skip reconciliation
    const userHasPaid = sessionData?.govUkPayment?.state?.status === "created";
    if (userHasPaid) {
      const responseData: ValidationResponse = {
        message: "Payment process initiated, skipping reconciliation",
        changesFound: null,
        reconciledSessionData: sessionData,
      };
      await createAuditEntry(sessionId, responseData);
      return res.status(200).json(responseData);
    }

    // fetch the latest flow diffs for this session's flow
    const flowDiff = await diffLatestPublishedFlow({
      flowId,
      since: sessionUpdatedAt,
    });

    if (!flowDiff) {
      const responseData: ValidationResponse = {
        message: "No content changes since last save point",
        changesFound: false,
        reconciledSessionData: sessionData,
      };
      await createAuditEntry(sessionId, responseData);
      return res.status(200).json(responseData);
    }

    const alteredNodes = Object.entries(flowDiff).map(([nodeId, node]) => ({
      ...node,
      id: nodeId,
    }));

    const { reconciledSessionData, alteredSectionIds } =
      await reconcileSessionData({ sessionData, alteredNodes });

    const responseData: ValidationResponse = {
      message:
        "This service has been updated since you last saved your application." +
        " We will ask you to answer any updated questions again when you continue.",
      changesFound: true,
      alteredSectionIds,
      reconciledSessionData,
    };

    await createAuditEntry(sessionId, responseData);
    return res.status(200).json(responseData);
  } catch (error) {
    return next({
      error,
      message: "Failed to validate session",
    });
  }
}

async function reconcileSessionData({
  sessionData: originalData,
  alteredNodes,
}: {
  sessionData: LowCalSession["data"];
  alteredNodes: Array<Node>;
}): Promise<ReconciledSession> {
  const sessionData = { ...originalData }; // copy original data for modification
  const alteredSectionIds: string[] = [];

  const currentFlow = await getMostRecentPublishedFlow(sessionData.id);

  const findParentNode = (nodeId: string): string | undefined => {
    const [parentId, _] =
      Object.entries(currentFlow).find(([_, node]) =>
        node.edges?.includes(nodeId)
      ) || [];
    return parentId;
  };

  // create ordered breadcrumbs to be able to look up section IDs later
  const orderedBreadcrumbs: OrderedBreadcrumbs = sortBreadcrumbs(
    currentFlow as FlowGraph,
    sessionData.breadcrumbs
  );

  const removeBreadcrumb = (nodeId: string) => {
    if (sessionData.breadcrumbs[nodeId]) {
      delete sessionData.breadcrumbs[nodeId];
    }
    const crumb: NormalizedCrumb | undefined = orderedBreadcrumbs.find(
      (crumb) => crumb.id === nodeId!
    );
    if (
      crumb &&
      crumb?.sectionId &&
      sessionData.breadcrumbs[crumb.sectionId!]
    ) {
      delete sessionData.breadcrumbs[crumb.sectionId!];
      alteredSectionIds.push(crumb.sectionId);
    }
  };

  // TODO - ensure all passport keys are cleaned up
  const removePassportValue = (nodeId: string) => {
    // a flow schema can store the planx variable name under any of these keys
    const planx_keys = ["fn", "val", "output", "dataFieldBoundary"];
    planx_keys.forEach((key) => {
      // check if a removed breadcrumb has a passport var based on the published content at save point
      if (sessionData && currentFlow[nodeId]?.data?.[key]) {
        // if it does, remove that passport variable from our session so we don't auto-answer changed questions before the user sees them
        delete sessionData.passport?.data?.[currentFlow[nodeId].data?.[key]];
      }
    });
  };

  const removeSessionDataForNodeId = (nodeId: string) => {
    removeBreadcrumb(nodeId);
    removePassportValue(nodeId);
  };

  // update breadcrumbs
  for (const node of alteredNodes) {
    if (node.type === ComponentType.Section) {
      // ignore section content changes and do not included these in alteredSectionIds
      continue;
    }
    removeSessionDataForNodeId(node.id!);
    // if an answer has changed, find it's parent and remove that from breadcrumbs
    if (node.type === ComponentType.Answer) {
      const parentId = findParentNode(node.id!);
      if (parentId && sessionData.breadcrumbs[parentId!]) {
        removeSessionDataForNodeId(parentId!);
      }
    }
  }

  return {
    reconciledSessionData: sessionData,
    alteredSectionIds,
  };
}

async function diffLatestPublishedFlow({
  flowId,
  since,
}: {
  flowId: string;
  since: string;
}): Promise<PublishedFlow["data"] | null> {
  const response: {
    diff_latest_published_flow: { data: PublishedFlow["data"] | null };
  } = await adminClient.request(
    gql`
      query GetFlowDiff($flowId: uuid!, $since: timestamptz!) {
        diff_latest_published_flow(
          args: { source_flow_id: $flowId, since: $since }
        ) {
          data
        }
      }
    `,
    { flowId, since }
  );
  return response.diff_latest_published_flow.data;
}

async function findSession({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string;
}): Promise<Partial<LowCalSession> | undefined> {
  const response: { lowcal_sessions: Partial<LowCalSession>[] } =
    await adminClient.request(
      gql`
        query FindSession($sessionId: uuid!, $email: String!) {
          lowcal_sessions(
            where: { id: { _eq: $sessionId }, email: { _eq: $email } }
            limit: 1
          ) {
            flow_id
            data
            updated_at
          }
        }
      `,
      { sessionId, email }
    );
  return response.lowcal_sessions.length
    ? response.lowcal_sessions[0]
    : undefined;
}

async function createAuditEntry(
  sessionId: string,
  data: ValidationResponse
): Promise<void> {
  await adminClient.request(
    gql`
      mutation InsertReconciliationRequests(
        $session_id: String = ""
        $response: jsonb = {}
        $message: String = ""
      ) {
        insert_reconciliation_requests_one(
          object: {
            session_id: $session_id
            response: $response
            message: $message
          }
        ) {
          id
        }
      }
    `,
    {
      session_id: sessionId,
      response: data,
      message: data.message,
    }
  );
}
