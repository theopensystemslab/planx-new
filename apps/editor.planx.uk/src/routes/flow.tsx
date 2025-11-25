import { gql } from "@apollo/client";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { sortBy } from "lodash";
import natsort from "natsort";
import {
  compose,
  map,
  Matcher,
  mount,
  redirect,
  route,
  withData,
  withView,
} from "navi";
import mapAccum from "ramda/src/mapAccum";
import React from "react";

import { client } from "../lib/graphql";
import components from "../pages/FlowEditor/components/forms";
import FormModal from "../pages/FlowEditor/components/forms/FormModal";
import { SLUGS } from "../pages/FlowEditor/data/types";
import { useStore } from "../pages/FlowEditor/lib/store";
import type { Flow } from "../types";
import { makeTitle } from "./utils";
import { flowEditorView } from "./views/flowEditor";

const sorter = natsort({ insensitive: true });
const sortFlows = (a: { text: string }, b: { text: string }) =>
  sorter(a.text.replace(/\W|\s/g, ""), b.text.replace(/\W|\s/g, ""));

/**
 * For non admins, external portal (aka nested flow) selection should return:
 *   - Flows in my team
 *   - Flows set to copiable by others
 *   - Not source templates
 *   - Not the parent flow I am currently nesting within
 */
const getExternalPortals = async (currentTeam: string, currentFlow: string) => {
  const { data } = await client.query({
    query: gql`
      query GetExternalPortals {
        flows(order_by: { slug: asc }) {
          id
          slug
          name
          isTemplate: is_template
          canCreateFromCopy: can_create_from_copy
          team {
            id
            slug
            name
          }
        }
      }
    `,
  });

  // Always filter out the parent flow I am currently nesting within
  let filteredFlows = data.flows.filter(
    (flow: Flow) =>
      flow.team &&
      `${currentTeam}/${currentFlow}` !== `${flow.team.slug}/${flow.slug}`,
  );

  // For non admins, also filter out source templates, flows not copiable by others, and flows not in my team for a less-overwhelming selection
  const isPlatformAdmin = useStore.getState().user?.isPlatformAdmin;
  if (!isPlatformAdmin) {
    filteredFlows = filteredFlows.filter(
      (flow: Flow) =>
        !flow.isTemplate &&
        (flow.canCreateFromCopy || flow.team.slug === currentTeam),
    );
  }

  filteredFlows = filteredFlows.map(({ id, team, slug, name }: Flow) => ({
    id,
    name,
    slug,
    team: team.name,
  }));

  const flowsSortedByTeam = sortBy(filteredFlows, [(flow: Flow) => flow.team]);

  return flowsSortedByTeam;
};

const newNode = route(async (req) => {
  const {
    type = "question",
    before = undefined,
    parent = undefined,
    team,
    flow,
  } = req.params;

  const extraProps = {} as any;

  // Pass in list of relevant flows for portals
  // This makes testing and mocking simpler
  if (type === "nested-flow") {
    extraProps.flows = await getExternalPortals(team, flow);
  } else if (type === "folder") {
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

  return {
    title: makeTitle(`New ${type}`),
    view: (
      <FormModal
        type={type}
        Component={components[type]}
        extraProps={extraProps}
        before={before}
        parent={parent}
      />
    ),
  };
});

// If nodeId is invalid (e.g. a deleted node), fall back to flow
const validateNodeRoute = (route: Matcher<object, object>) =>
  map((req) => {
    const { team, flow, id } = req.params;
    const node = useStore.getState().getNode(id);
    if (!node) return redirect(`/${team}/${flow}`);
    return route;
  });

const editNode = validateNodeRoute(
  route(async (req) => {
    const {
      id,
      before = undefined,
      parent = undefined,
      team,
      flow,
    } = req.params;

    const node = useStore.getState().getNode(id) as {
      type: TYPES;
      [key: string]: any;
    };

    const extraProps = {} as any;

    if (node.type === TYPES.ExternalPortal)
      extraProps.flows = await getExternalPortals(team, flow);

    const type = SLUGS[node.type];
    const nodesWithOptions = [
      "question",
      "responsive-question",
      "checklist",
      "responsive-checklist",
    ];

    if (nodesWithOptions.includes(type)) {
      const childNodes = useStore.getState().childNodesOf(id);
      if (node.data?.categories) {
        extraProps.groupedOptions = mapAccum(
          (index: number, category: { title: string; count: number }) => [
            index + category.count,
            {
              title: category.title,
              children: childNodes.slice(index, index + category.count),
            },
          ],
          0,
          node.data.categories,
        )[1];
      } else {
        extraProps.options = childNodes;
      }
    }

    return {
      title: makeTitle(`Edit ${type}`),
      view: (
        <FormModal
          type={type}
          Component={components[type]}
          extraProps={extraProps}
          node={node}
          id={id}
          handleDelete={() => {
            useStore.getState().removeNode(id, parent!);
          }}
          before={before}
          parent={parent}
        />
      ),
    };
  }),
);

const nodeRoutes = mount({
  "/new/:before": newNode,
  "/new": newNode,
  "/:parent/nodes/new/:before": newNode,
  "/:parent/nodes/new": newNode,

  "/:id/edit": editNode,
  "/:id/edit/:before": editNode,
  "/:parent/nodes/:id/edit/:before": editNode,
  "/:parent/nodes/:id/edit": editNode,
});

const routes = compose(
  withData((req) => ({
    flow: req.params.flow.split(",")[0],
  })),

  withView(flowEditorView),

  mount({
    "/": route(async (req) => {
      return {
        title: makeTitle([req.params.team, req.params.flow].join("/")),
        // Default view of FlowEditor (single instance held in layout)
        view: () => null,
      };
    }),

    "/nodes": nodeRoutes,
  }),
);

export default routes;
