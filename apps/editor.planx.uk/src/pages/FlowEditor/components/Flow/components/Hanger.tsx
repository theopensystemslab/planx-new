import { NodeId } from "@opensystemslab/planx-core/types";
import { Link, useParams } from "@tanstack/react-router";
import classnames from "classnames";
import { useContextMenu } from "hooks/useContextMenu";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";
import React from "react";
import { useDrop } from "react-dnd";
import { getNodeRoute } from "utils/routeUtils/utils";

import { useStore } from "../../../lib/store";
import { getParentId } from "../lib/utils";

interface HangerProps {
  hidden?: boolean;
  parent?: NodeId;
  before?: NodeId;
}

interface Item {
  id: string;
  parent: string;
  text: string;
}

const Hanger: React.FC<HangerProps> = ({ before, parent, hidden = false }) => {
  parent = getParentId(parent);
  const { team: teamSlug, flow: flowSlug } = useParams({
    from: "/_authenticated/app/$team/$flow",
  });

  const [moveNode, isTemplatedFrom, flow, orderedFlow] = useStore((state) => [
    state.moveNode,
    state.isTemplatedFrom,
    state.flow,
    state.orderedFlow,
  ]);

  // When working in a templated flow, if any internal portal is marked as "isTemplatedNode", then the Hanger should be visible to add children
  const indexedParent = orderedFlow?.find(({ id }) => id === parent);
  const parentIsTemplatedInternalPortal = nodeIsTemplatedInternalPortal(
    flow,
    indexedParent,
  );
  const parentIsChildOfTemplatedInternalPortal =
    nodeIsChildOfTemplatedInternalPortal(flow, indexedParent);

  const hideHangerInTemplatedFlow = !(
    parentIsTemplatedInternalPortal || parentIsChildOfTemplatedInternalPortal
  );

  // Hiding the hanger is a proxy for disabling a 'view-only' user from adding, moving, cloning nodes
  const hideHangerFromUser = isTemplatedFrom
    ? hideHangerInTemplatedFlow
    : !useStore.getState().canUserEditTeam(teamSlug);

  const [{ canDrop, item }, drop] = useDrop({
    accept: ["DECISION", "PORTAL", "PAGE"],
    drop: (item: Item) => {
      moveNode(item.id, item.parent, before, parent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.isOver() && monitor.getItem(),
    }),
  });

  const handleContextMenu = useContextMenu({
    source: "hanger",
    relationships: { parent, before },
  });

  return (
    <li
      className={classnames("hanger", { hidden: hidden || hideHangerFromUser })}
      ref={drop}
    >
      <Link
        to={getNodeRoute(parent, before)}
        params={{
          team: teamSlug,
          flow: flowSlug,
          ...(parent && { parent }),
          ...(before && { before }),
        }}
        search={{ type: "question" }}
        preload={false}
        onContextMenu={handleContextMenu}
      >
        {canDrop && item && item.text}
      </Link>
    </li>
  );
};

export default Hanger;
