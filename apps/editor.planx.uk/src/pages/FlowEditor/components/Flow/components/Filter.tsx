import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import { Link } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import classNames from "classnames";
import { useContextMenu } from "hooks/useContextMenu";
import React from "react";
import { useDrag } from "react-dnd";

import { useStore } from "../../../lib/store";
import { getParentId } from "../lib/utils";
import Hanger from "./Hanger";
import Node from "./Node";

type Props = {
  type: TYPES;
  [key: string]: any;
};

const Filter: React.FC<Props> = React.memo((props) => {
  const [isClone, childNodes] = useStore((state) => [
    state.isClone,
    state.childNodesOf(props.id),
  ]);

  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });

  const parent = getParentId(props.parent);

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: props.id,
      parent,
      text: props.text,
    },
    type: "DECISION",
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleContextMenu = useContextMenu({
    source: "node",
    relationships: {
      parent,
      before: props.id,
      self: props.id,
    },
  });

  const Icon = ICONS[props.type];

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames("card", "decision", "type-Filter", {
          isDragging,
          isClone: isClone(props.id),
          isNote: childNodes.length === 0,
          wasVisited: props.wasVisited,
        })}
      >
        <Link
          to={
            parent
              ? "/app/$team/$flow/nodes/$parent/nodes/$id/edit"
              : "/app/$team/$flow/nodes/$id/edit"
          }
          params={{
            team,
            flow,
            id: props.id,
            ...(parent && { parent }),
          }}
          preload={false}
          onContextMenu={handleContextMenu}
          ref={drag}
        >
          {Icon && <Icon />}
          <span>{props.text}</span>
        </Link>
        <ol className="options">
          {childNodes.map((child) => (
            <Node
              key={child.id}
              {...child}
              showTemplatedNodeStatus={props.showTemplatedNodeStatus}
            />
          ))}
        </ol>
      </li>
    </>
  );
});

export default Filter;
