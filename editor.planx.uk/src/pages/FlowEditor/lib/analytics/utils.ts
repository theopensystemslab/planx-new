import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { DEFAULT_FLAG_CATEGORY } from "@opensystemslab/planx-core/types";

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
  const dom = new DOMParser().parseFromString(node.data.content, "text/html");
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
      : node?.data?.title ?? node?.data?.text ?? node?.data?.flagSet;
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
