import { gql } from "@apollo/client";
import {
  ComponentType as TYPES,
  DEFAULT_FLAG_CATEGORY,
  FlowStatus,
} from "@opensystemslab/planx-core/types";
import { client } from "lib/graphql";
import isEmpty from "lodash/isEmpty";
import isPlainObject from "lodash/isObject";

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
export function isAllowListKey(key: string): key is AllowListKey {
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

const sanitiseAllowListValues = ([key, value]: [key: string, value: unknown]): [
  string,
  unknown,
] => {
  if (!isPlainObject(value)) return [key, value];

  // If the value is an array, filter out empty values
  if (Array.isArray(value)) {
    const filteredArray = value.filter(
      (item) => item !== undefined && item !== null,
    );
    if (filteredArray.length === 0) return [key, undefined];
    return [key, filteredArray];
  }

  // For objects, also strip out empty values - we do not need to store these as allow list answers
  const sanitisedObject = Object.fromEntries(
    Object.entries(value).filter(([_key, value]) => Boolean(value)),
  );
  if (isEmpty(sanitisedObject)) return [key, undefined];
  return [key, sanitisedObject];
};

/**
 * Extract allowlist answers from breadcrumb data
 * e.g. data set automatically by components such as DrawBoundary
 */
export function getData(
  breadcrumb: Store.UserData,
): Partial<Record<AllowListKey, unknown>> | undefined {
  const dataSetByNode = breadcrumb.data;
  if (!dataSetByNode) return;

  const filteredEntries = Object.entries(dataSetByNode)
    .map(sanitiseAllowListValues)
    .filter(([key, value]) => isAllowListKey(key) && Boolean(value));

  if (!filteredEntries.length) return;
  const answerValues = Object.fromEntries(filteredEntries);

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
): Partial<Record<AllowListKey, unknown>> | undefined {
  const answers = getAnswers(nodeId, flow, breadcrumbs);
  const data = getData(breadcrumb);

  if (!answers && !data) return;
  const allowListAnswers = Object.assign({}, answers, data);

  return allowListAnswers;
}

const foiynppDashboard = {
  id: "d55b0362-3a21-4153-a53d-c1d6a55ff5e2",
  slugs: [
    "check-if-you-need-planning-permission",
    "find-out-if-you-need-planning-permission",
    "find-out-if-you-need-planning-permission-advice-service",
  ],
};

const rabDashboard = {
  id: "f3da39ec-bb4f-4ee0-8950-afcb5765d686",
  slugs: ["camden-report-a-planning-breach", "report-a-planning-breach"],
};

const discretionaryDashboard = {
  id: "34e5a17c-2f20-4543-be0b-4af8364dceee",
  slugs: [
    "check-constraints-on-a-property",
    "check-whether-you-need-a-building-control-application",
    "check-your-planning-constraints",
    "general-enquiries",
    "heritage-constraints",
    "notify-us-of-any-high-efficiency-alternative-energy-systems",
    "report-a-potential-dangerous-structure",
    "request-a-building-control-quote",
    "validation-requirements-live",
  ],
};

const submissionDashboard = {
  id: "040dad13-6783-4e48-9edc-be1b03aa5247",
};

export const getAnalyticsDashboardId = ({
  flowSlug,
  isSubmissionService,
}: {
  flowSlug: string;
  isSubmissionService: boolean;
}): string | undefined => {
  if (foiynppDashboard.slugs.includes(flowSlug)) return foiynppDashboard.id;
  if (rabDashboard.slugs.includes(flowSlug)) return rabDashboard.id;
  if (discretionaryDashboard.slugs.includes(flowSlug))
    return discretionaryDashboard.id;
  // Finally, fallback to check general submission services
  if (isSubmissionService) return submissionDashboard.id;

  return undefined;
};

export const generateAnalyticsLink = ({
  flowId,
  dashboardId,
}: {
  flowId: string;
  dashboardId: string;
}): string => {
  const url = new URL(
    `https://metabase.editor.planx.uk/public/dashboard/${dashboardId}`,
  );
  const search = new URLSearchParams({
    flow_id: flowId,
  }).toString();
  url.search = search;

  return url.toString();
};
