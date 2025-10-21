import { gql } from "@apollo/client";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { notFound } from "@tanstack/react-router";
import { sortBy } from "lodash";
import natsort from "natsort";
import mapAccum from "ramda/src/mapAccum";
import { Flow } from "types";

import { client } from "../../../../lib/graphql";
import { useStore } from "../../../../pages/FlowEditor/lib/store";

export interface FlowEditorData {
  id: string;
  flowStatus: FlowStatus;
  flowAnalyticsLink: string;
  templatedFrom: string;
  isTemplate: boolean;
  isFlowPublished: boolean;
  template?: {
    id: string;
    team: {
      name: string;
    };
    publishedFlows: {
      publishedAt: string;
      summary: string;
    }[];
  };
}

export interface GetFlowEditorDataResponse {
  flows: {
    id: string;
    status: FlowStatus;
    flowAnalyticsLink: string;
    templatedFrom: string;
    isTemplate: boolean;
    publishedFlowsAggregate: {
      aggregate: {
        count: number;
      };
    };
    template: {
      id: string;
      team: {
        name: string;
      };
      publishedFlows: {
        publishedAt: string;
        summary: string;
      }[];
    } | null;
  }[];
}

export interface BasicFlowData {
  id: string;
  name: string;
}

export interface BasicFlowResponse {
  flows: BasicFlowData[];
}

/**
 * Fetch comprehensive flow editor metadata including template info, publish status, etc.
 */
export const getFlowEditorData = async (
  flowSlug: string,
  teamSlug: string,
): Promise<FlowEditorData> => {
  const { data } = await client.query<GetFlowEditorDataResponse>({
    query: gql`
      query GetFlowMetadata($slug: String!, $team_slug: String!) {
        flows(
          limit: 1
          where: { slug: { _eq: $slug }, team: { slug: { _eq: $team_slug } } }
        ) {
          id
          status
          templatedFrom: templated_from
          isTemplate: is_template
          publishedFlowsAggregate: published_flows_aggregate {
            aggregate {
              count
            }
          }
          template {
            id
            team {
              name
            }
            publishedFlows: published_flows(
              order_by: { created_at: desc }
              limit: 1
            ) {
              publishedAt: created_at
              summary
            }
          }
        }
      }
    `,
    variables: {
      slug: flowSlug,
      team_slug: teamSlug,
    },
  });

  const flow = data.flows[0];
  if (!flow) {
    throw notFound();
  }

  return {
    id: flow.id,
    flowStatus: flow.status,
    flowAnalyticsLink: flow.flowAnalyticsLink,
    templatedFrom: flow.templatedFrom,
    isTemplate: flow.isTemplate,
    isFlowPublished: flow.publishedFlowsAggregate?.aggregate.count > 0,
    template: flow.template || undefined,
  };
};

/**
 * Fetch basic flow information (id, name) for initial setup
 */
export const getBasicFlowData = async (
  flowSlug: string,
  teamSlug: string,
): Promise<BasicFlowData> => {
  const { data } = await client.query<BasicFlowResponse>({
    query: gql`
      query GetFlow($flowSlug: String!, $teamSlug: String!) {
        flows(
          limit: 1
          where: {
            slug: { _eq: $flowSlug }
            team: { slug: { _eq: $teamSlug } }
          }
        ) {
          id
          name
        }
      }
    `,
    variables: {
      flowSlug,
      teamSlug,
    },
  });

  const flow = data.flows[0];
  if (!flow) {
    throw notFound();
  }

  return flow;
};

export const getExternalPortals = async (
  currentTeam: string,
  currentFlow: string,
) => {
  const { data } = await client.query({
    query: gql`
      query GetFlows {
        flows(order_by: { slug: asc }) {
          id
          slug
          name
          isTemplate: is_template
          team {
            slug
            name
          }
        }
      }
    `,
  });

  const filteredFlows = data.flows
    .filter(
      (flow: Flow) =>
        flow.team &&
        `${currentTeam}/${currentFlow}` !== `${flow.team.slug}/${flow.slug}` &&
        !flow.isTemplate,
    )
    .map(({ id, team, slug, name }: Flow) => ({
      id,
      name,
      slug,
      team: team.name,
    }));

  const flowsSortedByTeam = sortBy(filteredFlows, [(flow: Flow) => flow.team]);

  return flowsSortedByTeam;
};

const sorter = natsort({ insensitive: true });
export const sortFlows = (a: { text: string }, b: { text: string }) =>
  sorter(a.text.replace(/\W|\s/g, ""), b.text.replace(/\W|\s/g, ""));

/**
 * Calculates extraProps for FormModal based on node type and context
 * Used by both new node creation and edit node routes
 */
export const calculateExtraProps = async (
  type: string,
  team: string,
  flow: string,
  options?: {
    nodeId?: string;
    node?: any;
    isEdit?: boolean;
  },
): Promise<any> => {
  const extraProps: any = {};

  // Handle external portals - both new nested-flow type and existing ExternalPortal nodes
  if (type === "nested-flow" || options?.node?.type === TYPES.ExternalPortal) {
    extraProps.flows = await getExternalPortals(team, flow);
  }

  // Handle folder type - both new and type changes
  if (type === "folder") {
    extraProps.flows = Object.entries(useStore.getState().flow)
      .filter(
        ([id, v]: any) =>
          v.type === TYPES.InternalPortal &&
          !window.location.pathname.includes(id) &&
          v.data?.text,
      )
      .map(([id, { data }]: any) => ({ id, text: data.text }))
      .sort(sortFlows);
  }

  // Handle checklist and question groupedOptions/options (edit only)
  if (
    options?.isEdit &&
    options?.nodeId &&
    (type === "checklist" || type === "question")
  ) {
    const childNodes = useStore.getState().childNodesOf(options.nodeId);
    if (options.node?.data?.categories) {
      extraProps.groupedOptions = mapAccum(
        (index: number, category: { title: string; count: number }) => [
          index + category.count,
          {
            title: category.title,
            children: childNodes.slice(index, index + category.count),
          },
        ],
        0,
        options.node.data.categories,
      )[1];
    } else {
      extraProps.options = childNodes;
    }
  }

  return extraProps;
};
