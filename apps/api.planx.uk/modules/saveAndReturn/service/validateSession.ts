import { gql } from "graphql-request";
import omit from "lodash/omit.js";
import { getMostRecentPublishedFlow } from "../../../helpers.js";
import { sortBreadcrumbs } from "@opensystemslab/planx-core";
import { ComponentType } from "@opensystemslab/planx-core/types";
import type {
  NormalizedCrumb,
  OrderedBreadcrumbs,
  FlowGraph,
} from "@opensystemslab/planx-core/types";
import type {
  LowCalSession,
  LowCalSessionData,
  PublishedFlow,
  Node,
} from "../../../types.js";
import { $api } from "../../../client/index.js";
import type { ValidationResponse } from "../types.js";

export type ReconciledSession = {
  alteredSectionIds: Array<string>;
  reconciledSessionData: Omit<LowCalSessionData, "passport">;
};

// TODO - Ensure reconciliation handles:
//  * collected flags
//  * component dependencies like FindProperty, DrawBoundary, PlanningConstraints
export async function validateSession(
  sessionId: string,
  fetchedSession: Partial<LowCalSession>,
) {
  const sessionData = omit(fetchedSession.data!, "passport");
  const sessionUpdatedAt = fetchedSession.updated_at!;
  const flowId = fetchedSession.flow_id!;

  // if a user has paid, skip reconciliation
  // Docs: https://docs.payments.service.gov.uk/api_reference/#payment-status-meanings
  const paymentStartedStatuses = ["created", "submitted", "success"];
  const userStatus = sessionData?.govUkPayment?.state?.status;
  const userHasPaid = userStatus && paymentStartedStatuses.includes(userStatus);

  if (userHasPaid) {
    const responseData: ValidationResponse = {
      message: "Payment process initiated, skipping reconciliation",
      changesFound: null,
      reconciledSessionData: sessionData,
    };
    await createAuditEntry(sessionId, responseData);
    return responseData;
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
    return responseData;
  }

  const alteredNodes = Object.entries(flowDiff).map(([nodeId, node]) => ({
    ...node,
    id: nodeId,
  }));

  const { reconciledSessionData, alteredSectionIds } =
    await reconcileSessionData({ sessionData, alteredNodes });

  const responseData: ValidationResponse = {
    message:
      "This service has been updated since you last saved your progress." +
      " We will ask you to answer any updated questions again when you continue.",
    changesFound: true,
    alteredSectionIds,
    reconciledSessionData,
  };

  await createAuditEntry(sessionId, responseData);
  return responseData;
}

async function reconcileSessionData({
  sessionData: originalData,
  alteredNodes,
}: {
  sessionData: Omit<LowCalSessionData, "passport">;
  alteredNodes: Array<Node>;
}): Promise<ReconciledSession> {
  const sessionData = { ...originalData }; // copy original data for modification
  const alteredSectionIds = new Set<string>();

  const currentFlow = await getMostRecentPublishedFlow(sessionData.id);
  if (!currentFlow)
    throw Error(`Unable to find published flow for flow ${sessionData.id}`);

  // create ordered breadcrumbs to be able to look up section IDs later
  const orderedBreadcrumbs: OrderedBreadcrumbs = sortBreadcrumbs(
    currentFlow as FlowGraph,
    sessionData.breadcrumbs,
  );

  const findParentNode = (nodeId: string): string | undefined => {
    const [parentId, _] =
      Object.entries(currentFlow).find(([_, node]) =>
        node.edges?.includes(nodeId),
      ) || [];
    return parentId;
  };

  const removeAlteredAndAffectedBreadcrumb = (nodeId: string) => {
    const foundParentId = findParentNode(nodeId);
    const matchingCrumbs: NormalizedCrumb[] = orderedBreadcrumbs.filter(
      (crumb) =>
        crumb.id === nodeId || (foundParentId && crumb.id === foundParentId),
    );

    for (const crumb of matchingCrumbs) {
      // delete crumb
      if (sessionData.breadcrumbs[crumb.id]) {
        delete sessionData.breadcrumbs[crumb.id];
      }

      // delete crumb's section
      if (
        crumb &&
        crumb?.sectionId &&
        sessionData.breadcrumbs[crumb.sectionId!]
      ) {
        delete sessionData.breadcrumbs[crumb.sectionId!];
        alteredSectionIds.add(crumb.sectionId);
      }
    }
  };

  // remove all auto-answered breadcrumbs because their automation may rely on the same data values as an altered node
  //   (auto-answers can be reconstructed on forwards navigation if they are still auto-answerable on resume)
  for (const [id, crumb] of Object.entries(sessionData.breadcrumbs)) {
    if (crumb.auto === true && sessionData.breadcrumbs[id]) {
      delete sessionData.breadcrumbs[id];
    }
  }

  // remove any altered or affected breadcrumbs
  for (const node of alteredNodes) {
    // ignore section content changes and do not included these in alteredSectionIds
    if (node.type === ComponentType.Section) {
      continue;
    }
    if (node.id) removeAlteredAndAffectedBreadcrumb(node.id);
  }

  return {
    reconciledSessionData: sessionData,
    alteredSectionIds: [...alteredSectionIds],
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
  } = await $api.client.request(
    gql`
      query GetFlowDiff($flowId: uuid!, $since: timestamptz!) {
        diff_latest_published_flow(
          args: { source_flow_id: $flowId, since: $since }
        ) {
          data
        }
      }
    `,
    { flowId, since },
  );
  return response.diff_latest_published_flow.data;
}

interface FindSession {
  sessions: Partial<LowCalSession>[];
}

export async function findSession({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string;
}): Promise<Partial<LowCalSession> | undefined> {
  const response = await $api.client.request<FindSession>(
    gql`
      query FindSession($sessionId: uuid!, $email: String!) {
        sessions: lowcal_sessions(
          where: {
            id: { _eq: $sessionId }
            email: { _eq: $email }
            user_status: { _in: ["draft", "awaitingPayment"] }
          }
          limit: 1
        ) {
          flow_id
          data
          updated_at
          lockedAt: locked_at
          paymentRequests: payment_requests {
            id
            payeeName: payee_name
            payeeEmail: payee_email
          }
        }
      }
    `,
    { sessionId, email },
  );
  return response.sessions.length ? response.sessions[0] : undefined;
}

async function createAuditEntry(
  sessionId: string,
  data: ValidationResponse,
): Promise<void> {
  await $api.client.request(
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
    },
  );
}
