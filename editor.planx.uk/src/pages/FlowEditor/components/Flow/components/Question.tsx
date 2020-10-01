import classNames from "classnames";
import React from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";
import { api, useStore } from "../../../lib/store";
import { getParentId } from "../../../lib/utils";
import Hanger from "./Hanger";
import Node from "./Node";
import { nodeIcon } from "../../shared";

type Props = any;

const Question: React.FC<Props> = React.memo((props) => {
  const [isClone, childNodes] = useStore((state) => [
    state.isClone,
    state.childNodesOf(props.id),
  ]);

  const parent = getParentId(props.parent);

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: props.id,
      parent,
      text: props.text,
      type: "DECISION",
    },
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
    api.getState().copyNode(props.id);
  };

  const Icon = nodeIcon(props.$t);

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames("card", "decision", {
          isDragging,
          isClone: isClone(props.id),
          isNote: childNodes.length === 0,
        })}
      >
        <Link href={href} prefetch={false} onContextMenu={handleContext}>
          {Icon && <Icon />}
          <span ref={drag}>{props.text}</span>
        </Link>
        <ol>
          {childNodes.map((child: any) => (
            <Node key={child.id} {...child} />
          ))}
        </ol>
      </li>
    </>
  );
});

export default Question;
