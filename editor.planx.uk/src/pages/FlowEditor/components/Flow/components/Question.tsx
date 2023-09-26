import ErrorIcon from "@mui/icons-material/Error";
import { TYPES } from "@planx/components/types";
import { ICONS } from "@planx/components/ui";
import classNames from "classnames";
import React from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";

import { useStore } from "../../../lib/store";
import { getParentId } from "../lib/utils";
import Hanger from "./Hanger";
import Node from "./Node";

type Props = {
  type: TYPES | "Error";
  [key: string]: any;
  wasVisited?: boolean;
};

const Question: React.FC<Props> = React.memo((props) => {
  const [isClone, childNodes, copyNode] = useStore((state) => [
    state.isClone,
    state.childNodesOf(props.id),
    state.copyNode,
  ]);

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

  let href = `${window.location.pathname}/nodes/${props.id}/edit`;
  if (parent) {
    href = `${window.location.pathname}/nodes/${parent}/nodes/${props.id}/edit`;
  }

  const handleContext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copyNode(props.id);
  };

  const Icon = props.type === "Error" ? ErrorIcon : ICONS[props.type];
  // If there is an error, the icon has a semantic meaning and needs a title
  const iconTitleAccess = props.type === "Error" ? "Error" : undefined;

  return (
    <>
      <Hanger
        hidden={isDragging}
        before={props.id}
        parent={parent}
      />
      <li
        className={classNames("card", "decision", {
          isDragging,
          isClone: isClone(props.id),
          isNote: childNodes.length === 0,
          wasVisited: props.wasVisited,
          hasFailed: props.hasFailed,
        })}
      >
        <Link
          href={href}
          prefetch={false}
          onContextMenu={handleContext}
          ref={drag}
        >
          {Icon && <Icon titleAccess={iconTitleAccess} />}
          <span>{props.text}</span>
        </Link>
        <ol className="options">
          {childNodes.map((child: any) => (
            <Node key={child.id} {...child} />
          ))}
        </ol>
      </li>
    </>
  );
});

export default Question;
