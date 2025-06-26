import {
  ComponentType as TYPES,
  DEFAULT_FLAG_CATEGORY,
  FlowStatus,
} from "@opensystemslab/planx-core/types";

import { Store } from "../store";
import { ALLOW_LIST } from "./provider";
import {
  AllowListKey,
  BackwardsNavigationInitiatorType,
  BackwardsNavigationMetadata,
  BackwardsTargetMetadata,
} from "./types";

/**
 * Generate meaningful title for content analytic log
 */
export function getContentTitle(node: Store.Node): string {
  const dom = new DOMParser().parseFromString(node.data?.content, "text/html");
  const h1 = dom.body.getElementsByTagName("h1")[0]?.textContent;
  const text = h1 || dom.body.textContent;
  if (!text) return `Content: ${node.id}`;
  const TITLE_LENGTH = 50;
  const truncate = (data: string) =>
    data.length > TITLE_LENGTH ? data.substring(0, TITLE_LENGTH) + "..." : data;
  const title = truncate(text);
  return title;
}

export function extractNodeTitle(node: Store.Node): string {
  const nodeTitle =
    node?.type === TYPES.Content
      ? getContentTitle(node)
      : (node?.data?.title ??
        node?.data?.text ??
        node?.data?.flagSet ??
        node?.data?.category ??
        node?.data?.heading);
  return nodeTitle;
}

export function getTargetNodeDataFromFlow(
  nodeId: string,
  flow: Store.Flow,
): BackwardsTargetMetadata {
  const node = flow[nodeId];
  const nodeType = node?.type ? TYPES[node.type] : null;
  const nodeMetadata: BackwardsTargetMetadata = {
    title: extractNodeTitle(node),
    type: nodeType,
    id: nodeId,
  };
  return nodeMetadata;
}

export function generateBackwardsNavigationMetadata(
  initiator: BackwardsNavigationInitiatorType,
  flow: Store.Flow,
  nodeId?: string,
): BackwardsNavigationMetadata {
  const targetNodeMetadata = nodeId
    ? getTargetNodeDataFromFlow(nodeId, flow)
    : {};
  const metadata: BackwardsNavigationMetadata =
    initiator === "change"
      ? { change: targetNodeMetadata }
      : { back: targetNodeMetadata };
  return metadata;
}

export function getNodeMetadata(
  node: Store.Node,
  resultData: any,
  nodeId: string,
  breadcrumbs: Store.Breadcrumbs,
) {
  const isAutoAnswered = breadcrumbs[nodeId]?.auto || false;
  switch (node?.type) {
    case TYPES.Result: {
      const flagSet = node?.data?.flagSet || DEFAULT_FLAG_CATEGORY;
      const data = resultData(flagSet, node?.data?.overrides);
      const { displayText, flag } = data[flagSet];
      return {
        flagSet,
        displayText,
        flag,
        isAutoAnswered,
      };
    }
    default:
      return {
        isAutoAnswered,
      };
  }
}

/**
 * Check whether the key is in the ALLOW_LIST and ensure it's of the correct
 * type to avoid repeated casting.
 */
export function isAllowListKey(key: any): key is AllowListKey {
  return (ALLOW_LIST as readonly string[]).includes(key);
}

/**
 * Extract allowlist answers from user answers
 * e.g., from Checklist or Question components
 */
export function getAnswers(
  nodeId: string,
  flow: Store.Flow,
  breadcrumbs: Store.Breadcrumbs,
): Partial<Record<AllowListKey, any>> | undefined {
  const { data } = flow[nodeId];
  const nodeFn: string | undefined = data?.fn || data?.val;

  if (!nodeFn || !isAllowListKey(nodeFn)) return;

  const answerIds = breadcrumbs[nodeId]?.answers;
  if (!answerIds) return;

  const answerValues = answerIds.map((answerId) => flow[answerId]?.data?.val);
  const filteredAnswerValues = answerValues.filter(Boolean);
  if (!filteredAnswerValues.length) return;

  const answers: Partial<Record<AllowListKey, string[]>> = {
    [nodeFn]: filteredAnswerValues,
  };

  return answers;
}

/**
 * Extract allowlist answers from breadcrumb data
 * e.g. data set automatically by components such as DrawBoundary
 */
export function getData(
  breadcrumb: Store.UserData,
): Partial<Record<AllowListKey, any>> | undefined {
  const dataSetByNode = breadcrumb.data;
  if (!dataSetByNode) return;

  const filteredEntries = Object.entries(dataSetByNode)
    .filter(([key, value]) => isAllowListKey(key) && Boolean(value))
    .map(([key, value]) => ({ [key]: value }));

  if (!filteredEntries.length) return;
  const answerValues = Object.assign({}, ...filteredEntries);

  return answerValues;
}

export function determineLogDirection(
  breadcrumbs: Store.Breadcrumbs,
  previousBreadcrumbs: Store.Breadcrumbs | undefined,
) {
  if (!previousBreadcrumbs) return;
  const curLength = Object.keys(breadcrumbs).length;
  const prevLength = Object.keys(previousBreadcrumbs).length;
  if (curLength > prevLength) return "forwards";
  if (curLength < prevLength) return "backwards";
}

export function findUpdatedBreadcrumbKeys(
  breadcrumbs: Store.Breadcrumbs,
  previousBreadcrumbs: Store.Breadcrumbs,
): string[] | undefined {
  const currentKeys = Object.keys(breadcrumbs);
  const previousKeys = Object.keys(previousBreadcrumbs);
  const updatedBreadcrumbKeys = currentKeys.filter(
    (breadcrumb) => !previousKeys.includes(breadcrumb),
  );
  return updatedBreadcrumbKeys;
}

/**
 * When a user moves through a flow the data being written can be determined by
 * the node in the flow handled by `getAnswers` or the component being used
 * handled by `getData`
 */
export function getAllowListAnswers(
  nodeId: string,
  breadcrumb: Store.UserData,
  flow: Store.Flow,
  breadcrumbs: Store.Breadcrumbs,
): Partial<Record<AllowListKey, any>> | undefined {
  const answers = getAnswers(nodeId, flow, breadcrumbs);
  const data = getData(breadcrumb);

  if (!answers && !data) return;
  const allowListAnswers = Object.assign({}, answers, data);

  return allowListAnswers;
}

export type Environment = keyof typeof DASHBOARD_PUBLIC_IDS;

// The dashboard links across Metabase staging and production are different, so we need to store and be able to access both
export const DASHBOARD_PUBLIC_IDS = {
  production: {
    discretionary: "34e5a17c-2f20-4543-be0b-4af8364dceee",
    FOIYNPP: "d55b0362-3a21-4153-a53d-c1d6a55ff5e2",
    RAB: "f3da39ec-bb4f-4ee0-8950-afcb5765d686",
    submission: "040dad13-6783-4e48-9edc-be1b03aa5247",
  },
  staging: {
    discretionary: "0c0abafd-e919-4da2-a5b3-1c637f703954",
    FOIYNPP: "d6303f0b-d6e8-4169-93c0-f988a93e19bc",
    RAB: "85c120bf-39b0-4396-bf8a-254b885e77f5",
    submission: "363fd552-8c2b-40d9-8b7a-21634ec182cc",
  },
} as const;

export const getFOIYNPP = (environment: Environment) => ({
  id: DASHBOARD_PUBLIC_IDS[environment].FOIYNPP,
  slugs: [
    "check-if-you-need-planning-permission",
    "find-out-if-you-need-planning-permission",
  ],
});

export const getRAB = (environment: Environment) => ({
  id: DASHBOARD_PUBLIC_IDS[environment].RAB,
  slugs: ["camden-report-a-planning-breach", "report-a-planning-breach"],
});

export const getDiscretionary = (environment: Environment) => ({
  id: DASHBOARD_PUBLIC_IDS[environment].discretionary,
  slugs: [
    "check-constraints-on-a-property",
    "check-whether-you-need-a-building-control-application",
    "check-your-planning-constraints",
    "heritage-constraints",
    "notify-us-of-any-high-efficiency-alternative-energy-systems",
    "report-a-potential-dangerous-structure",
    "request-a-building-control-quote",
    "validation-requirements-live",
  ],
});

export const getSubmission = (
  environment: Environment,
  isSubmissionService: boolean,
): { id: string } | undefined => {
  // We don't need to exclude RAB slugs here because this function is called after getRAB() and they're already excluded
  if (isSubmissionService) {
    return {
      id: DASHBOARD_PUBLIC_IDS[environment].submission,
    };
  }
  return undefined;
};

export const generateAnalyticsLink = ({
  flowStatus,
  environment,
  flowId,
  flowSlug,
  isSubmissionService,
}: {
  flowStatus: FlowStatus;
  environment: Environment;
  flowId: string;
  flowSlug: string;
  isSubmissionService: boolean;
}): string | undefined => {
  if (flowStatus === "offline") return undefined;

  let dashboardId: string | undefined;

  const foiynpp = getFOIYNPP(environment);
  const rab = getRAB(environment);
  const discretionary = getDiscretionary(environment);
  const submission = getSubmission(environment, isSubmissionService);

  if (foiynpp.slugs.includes(flowSlug)) {
    dashboardId = foiynpp.id;
  } else if (rab.slugs.includes(flowSlug)) {
    // since RAB is technically a submission service, we have to check it before general submission services below
    dashboardId = rab.id;
  } else if (discretionary.slugs.includes(flowSlug)) {
    dashboardId = discretionary.id;
  } else if (submission) {
    dashboardId = submission.id;
  }

  if (!dashboardId) {
    return;
  }

  const baseDomain = environment === "production" ? "uk" : "dev";
  const host = `https://metabase.editor.planx.${baseDomain}`;
  const pathname = `/public/dashboard/${dashboardId}`;
  const url = new URL(pathname, host);
  const search = new URLSearchParams({
    flow_id: flowId,
  }).toString();
  url.search = search;

  return url.toString();
};
