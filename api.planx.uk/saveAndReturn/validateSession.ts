import { gql } from "graphql-request";
import { NextFunction, Request, Response } from "express";
import * as jsondiffpatch from "jsondiffpatch";
import {
  adminGraphQLClient as adminClient,
  publicGraphQLClient as publicClient,
} from "../hasura";
import { getMostRecentPublishedFlow, getPublishedFlowByDate } from "../helpers";
import {
  getSaveAndReturnPublicHeaders,
  stringifyWithRootKeysSortedAlphabetically,
} from "./utils";
import { normalizeFlow, sortBreadcrumbs } from "@opensystemslab/planx-core";
import type {
  OrderedBreadcrumbs,
  NormalizedCrumb,
} from "@opensystemslab/planx-core";
import type { Breadcrumb, LowCalSession, Node } from "../types";

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

    const sessionData = await findSession(sessionId, email.toLowerCase());

    if (sessionData) {
      // if a user has paid, skip reconciliation steps and return *without* calling updateLowcalSessionData
      if (sessionData.data.govUkPayment?.state?.status === "created") {
        const responseData = {
          message: "Payment process initiated, skipping reconciliation",
          alteredNodes: null,
          removedBreadcrumbs: null,
          reconciledSessionData: sessionData.data,
        };
        await createAuditEntry(sessionId, responseData, responseData.message);
        return res.status(200).json(responseData);
      }

      // reconcile content changes between the published flow state at point of resuming and when the applicant last left off
      const [currentFlow, savedFlow] = await Promise.all([
        getMostRecentPublishedFlow(sessionData.data.id),
        getPublishedFlowByDate(sessionData.data.id, sessionData.updated_at),
      ]);

      if (!currentFlow || !savedFlow) {
        return next({
          status: 404,
          message: "Unable to find a published version of this flow",
        });
      }

      const delta = jsondiffpatch.diff(currentFlow, savedFlow);
      // if there have been content changes, make a list of the alteredNodes
      if (delta) {
        const alteredNodes: Node[] = Object.keys(delta).map((key) => ({
          id: key,
          ...currentFlow[key],
        }));
        if (alteredNodes.length) {
          // each NormalizedCrumb will include a sectionId where relevant (used later)
          const orderedBreadcrumbs: OrderedBreadcrumbs = sortBreadcrumbs(
            normalizeFlow(savedFlow),
            sessionData.data.breadcrumbs
          );
          const removedBreadcrumbs: Breadcrumb = {};
          alteredNodes.forEach((node) => {
            // if the session breadcrumbs include any altered content,
            // remove those breadcrumbs so the user will be re-prompted to answer those questions
            const affectedBreadcrumb = orderedBreadcrumbs.find(
              (crumb: NormalizedCrumb) => crumb.id == node.id!
            );
            if (affectedBreadcrumb && sessionData.data.breadcrumbs[node.id!]) {
              // remove affected breadcrumbs
              removedBreadcrumbs[node.id!] =
                sessionData.data.breadcrumbs[node.id!];
              delete sessionData.data.breadcrumbs[node.id!];

              // also remove the associated section
              const affectedSectionId = affectedBreadcrumb.sectionId;
              if (
                affectedSectionId &&
                sessionData.data.breadcrumbs[affectedSectionId]
              ) {
                removedBreadcrumbs[affectedSectionId] =
                  sessionData.data.breadcrumbs[affectedSectionId];
                delete sessionData.data.breadcrumbs[affectedSectionId];
              }
            }
          });

          // if we removed user breadcrumbs, check if those breadcrumbs have associated passport variables
          if (Object.keys(removedBreadcrumbs).length) {
            // a flow schema can store the planx variable name under any of these keys
            const planx_keys = ["fn", "val", "output", "dataFieldBoundary"];
            planx_keys.forEach((key) => {
              Object.keys(removedBreadcrumbs).forEach((nodeId) => {
                // check if a removed breadcrumb has a passport var based on the published content at save point
                if (sessionData && savedFlow[nodeId]?.data?.[key]) {
                  // if it does, remove that passport variable from our sessionData so we don't auto-answer changed questions before the user sees them
                  delete sessionData.data.passport?.data?.[
                    currentFlow[nodeId].data?.[key]
                  ];
                }
              });
            });
          }

          // TODO: FUTURE RECONCILIATION CHECKS
          //   **what about collected flags? what about `auto: true`? component dependencies like FindProp/Draw/PlanningConstraints?

          // update the lowcal_session.data to match our updated in-memory sessionData.data
          //   XX: apply sorting to match the original get/set methods used in editor.planx.uk/src/lib/lowcalStorage.ts
          const sortedSessionData = stringifyWithRootKeysSortedAlphabetically(
            sessionData.data
          );
          const reconciledSessionData = await updateLowcalSessionData(
            sessionId,
            JSON.parse(sortedSessionData),
            email
          );

          const responseData = {
            message:
              "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
            alteredNodes,
            removedBreadcrumbs,
            reconciledSessionData,
          };
          await createAuditEntry(sessionId, responseData, responseData.message);
          return res.status(200).json(responseData);
        }
      } else {
        const responseData = {
          message: "No content changes since last save point",
          alteredNodes: null,
          removedBreadcrumbs: null,
          reconciledSessionData: sessionData.data,
        };
        await createAuditEntry(sessionId, responseData, responseData.message);
        return res.status(200).json(responseData);
      }
    } else {
      return next({
        status: 404,
        message: "Unable to find your session",
      });
    }
  } catch (error) {
    return next({
      error,
      message: "Failed to validate session",
    });
  }
}

const findSession = async (
  sessionId: string,
  email: string
): Promise<LowCalSession | undefined> => {
  const query = gql`
    query FindSession($sessionId: uuid!) {
      lowcal_sessions_by_pk(id: $sessionId) {
        data
        updated_at
      }
    }
  `;
  const headers = getSaveAndReturnPublicHeaders(sessionId, email);
  const response = await publicClient.request(query, { sessionId }, headers);
  return response.lowcal_sessions?.[0];
};

const updateLowcalSessionData = async (
  sessionId: string,
  data: LowCalSession,
  email: string
) => {
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
};

const createAuditEntry = async (
  sessionId: string,
  data: any,
  message: string
) => {
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
};
