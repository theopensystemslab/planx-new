import { gql } from "graphql-request";
import { NextFunction, Request, Response } from "express";
import * as jsondiffpatch from "jsondiffpatch";
import {
  adminGraphQLClient as adminClient,
  publicGraphQLClient as publicClient,
} from "../hasura";
import { getMostRecentPublishedFlow, getPublishedFlowByDate } from "../helpers";
import { getSaveAndReturnPublicHeaders } from "./utils";
import {
  sortBreadcrumbs,
  normalizeFlow,
  ComponentType,
} from "@opensystemslab/planx-core";
import type {
  NormalizedCrumb,
  FlowGraph,
} from "@opensystemslab/planx-core/types";
import type { Breadcrumb, LowCalSession, Flow, Node } from "../types";

export interface ValidationResponse {
  message: string;
  reconciledSessionData: LowCalSession["data"];
  alteredNodes?: Node[];
  removedBreadcrumbIds?: string[];
}

// TODO - ensure reconciliation handles:
//  * collected flags
//  * auto-answered component dependencies like FindProp/Draw/PlanningConstraints
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

    const fetchedSessionData = await findSession(
      sessionId,
      email.toLowerCase()
    );

    if (!fetchedSessionData) {
      return next({
        status: 404,
        message: "Unable to find your session",
      });
    }

    const sessionData = fetchedSessionData.data!;

    // if a user has paid, skip reconciliation
    const userHasPaid = sessionData?.govUkPayment?.state?.status === "created";
    if (userHasPaid) {
      const responseData: ValidationResponse = {
        message: "Payment process initiated, skipping reconciliation",
        alteredNodes: [],
        reconciledSessionData: sessionData,
      };
      await createAuditEntry(sessionId, responseData, responseData.message);
      return res.status(200).json(responseData);
    }

    // reconcile content changes between the published flow state at point of resuming and when the applicant last left off
    const [currentFlow, savedFlow] = await Promise.all([
      getMostRecentPublishedFlow(sessionData.id),
      getPublishedFlowByDate(sessionData.id, fetchedSessionData.updated_at!),
    ]);

    if (!currentFlow || !savedFlow) {
      return next({
        status: 404,
        message: "Unable to find a published version of this flow",
      });
    }

    const delta = jsondiffpatch.diff(currentFlow, savedFlow) || {};
    const alteredNodeIds: string[] = Object.keys(delta);

    let alteredNodes: Node[] = [];
    if (alteredNodeIds.length > 0) {
      alteredNodes = alteredNodeIds.map((id) => ({
        ...currentFlow[id],
        id,
      }));
    }

    // create ordered breadcrumbs to be able to look up section IDs later
    const orderedBreadcrumbs: NormalizedCrumb[] = sortBreadcrumbs(
      normalizeFlow(currentFlow as FlowGraph),
      sessionData.breadcrumbs
    );

    // update breadcrumbs
    const removedBreadcrumbIds: string[] = [];
    alteredNodes.forEach((node) => {
      // remove existing breadcrumbs to mark updated questions as unanswered
      if (sessionData.breadcrumbs[node.id!]) {
        removedBreadcrumbIds.push(node.id!);
        delete sessionData.breadcrumbs[node.id!];
      }

      // remove parent breadcrumbs of answers to mark questions
      // with updated responses as unanswered
      if (node.type == ComponentType.Answer) {
        const parent: NormalizedCrumb | undefined = orderedBreadcrumbs.find(
          (crumb: NormalizedCrumb) => crumb.answers?.includes(node.id!)
        );
        if (parent && sessionData.breadcrumbs[parent.id!]) {
          removedBreadcrumbIds.push(parent.id!);
          delete sessionData.breadcrumbs[parent.id!];
        }
      }

      // also remove the associated section to mark it as incomplete
      const crumb: NormalizedCrumb | undefined = orderedBreadcrumbs.find(
        (crumb) => crumb.id === node.id!
      );
      if (
        crumb &&
        crumb?.sectionId &&
        sessionData.breadcrumbs[crumb.sectionId!]
      ) {
        removedBreadcrumbIds.push(crumb.sectionId!);
        delete sessionData.breadcrumbs[crumb.sectionId!];
      }
    });

    // update passport data
    removedBreadcrumbIds.forEach((nodeId) => {
      // a flow schema can store the planx variable name under any of these keys
      const planx_keys = ["fn", "val", "output", "dataFieldBoundary"];
      planx_keys.forEach((key) => {
        // check if a removed breadcrumb has a passport var based on the published content at save point
        if (sessionData && savedFlow[nodeId]?.data?.[key]) {
          // if it does, remove that passport variable from our session so we don't auto-answer changed questions before the user sees them
          delete sessionData.passport?.data?.[savedFlow[nodeId].data?.[key]];
        }
      });
    });

    if (!alteredNodes || alteredNodes.length === 0) {
      const responseData: ValidationResponse = {
        message: "No content changes since last save point",
        reconciledSessionData: sessionData,
      };
      await createAuditEntry(sessionId, responseData, responseData.message);
      return res.status(200).json(responseData);
    }

    // store modified session data
    await updateLowcalSessionData(sessionId, sessionData, email);

    const responseData: ValidationResponse = {
      message:
        "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
      alteredNodes,
      removedBreadcrumbIds,
      reconciledSessionData: sessionData,
    };

    await createAuditEntry(sessionId, responseData, responseData.message);
    return res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    return next({
      error,
      message: "Failed to validate session",
    });
  }
}

async function findSession(
  sessionId: string,
  email: string
): Promise<Partial<LowCalSession> | undefined> {
  const query = gql`
    query FindSession($sessionId: uuid!) {
      lowcal_sessions(where: { id: { _eq: $sessionId } }, limit: 1) {
        data
        updated_at
      }
    }
  `;
  const headers = getSaveAndReturnPublicHeaders(sessionId, email);
  const response = await publicClient.request(query, { sessionId }, headers);
  return response.lowcal_sessions?.[0];
}

async function updateLowcalSessionData(
  sessionId: string,
  data: LowCalSession["data"],
  email: string
): Promise<LowCalSession> {
  const query = gql`
    mutation UpdateLowcalSessionData($sessionId: uuid!, $data: jsonb!) {
      update_lowcal_sessions_by_pk(
        pk_columns: { id: $sessionId }
        _set: { data: $data }
      ) {
        data
      }
    }
  `;
  const headers = getSaveAndReturnPublicHeaders(sessionId, email);
  const response = await publicClient.request(
    query,
    { sessionId, data },
    headers
  );
  return response.update_lowcal_sessions_by_pk?.data;
}

async function createAuditEntry(
  sessionId: string,
  data: ValidationResponse,
  message: string
): Promise<Record<"insert_reconciliation_requests_one", string>> {
  return await adminClient.request(
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
      message: message,
    }
  );
}
