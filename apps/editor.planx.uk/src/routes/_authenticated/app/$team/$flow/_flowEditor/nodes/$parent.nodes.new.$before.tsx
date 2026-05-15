import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import AddComponentModal from "pages/FlowEditor/components/forms/AddComponentModal";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import React from "react";
import { getNodeRoute } from "utils/routeUtils/utils";

import { loader } from "./-loader";
import type { NodeSearchParams } from "./route";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/nodes/$parent/nodes/new/$before",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { type = "question" } = deps;
    const { team, flow, parent, before } = params;

    return loader({
      team,
      flow,
      type,
      parent,
      before,
      includeHandleDelete: false,
    });
  },

  component: NewNodeWithBeforeModal,
});

function NewNodeWithBeforeModal() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const { type, extraProps, parent, before } = Route.useLoaderData();

  if (!search.type) {
    return <AddComponentModal parent={parent} before={before} />;
  }

  const queue = search.queue
    ? (search.queue.split(",") as NodeSearchParams["type"][])
    : [];

  const afterSubmit =
    queue.length > 0
      ? () => {
          const [nextType, ...remaining] = queue;
          navigate({
            to: getNodeRoute(parent, before),
            params: {
              team,
              flow,
              ...(parent && { parent }),
              ...(before && { before }),
            },
            search: {
              type: nextType,
              ...(remaining.length > 0 && { queue: remaining.join(",") }),
            },
          });
        }
      : undefined;

  return (
    <FormModal
      type={type}
      Component={components[type]}
      extraProps={extraProps}
      parent={parent}
      before={before}
      afterSubmit={afterSubmit}
    />
  );
}
