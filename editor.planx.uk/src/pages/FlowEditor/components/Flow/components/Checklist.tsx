import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import classNames from "classnames";
import mapAccum from "ramda/src/mapAccum";
import React, { useMemo } from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";

import { useStore } from "../../../lib/store";
import { getParentId } from "../lib/utils";
import Hanger from "./Hanger";
import Node from "./Node";

type Props = {
  type: TYPES;
  [key: string]: any;
  wasVisited?: boolean;
};

const Checklist: React.FC<Props> = React.memo((props) => {
  const [isClone, childNodes, copyNode] = useStore((state) => [
    state.isClone,
    state.childNodesOf(props.id),
    state.copyNode,
  ]);

  const parent = getParentId(props.parent);

  const groupedOptions = useMemo(
    () =>
      !props.data?.categories
        ? undefined
        : mapAccum(
            (index: number, category: { title: string; count: number }) => [
              index + category.count,
              {
                title: category.title,
                children: childNodes.slice(index, index + category.count),
              },
            ],
            0,
            props.data.categories,
          )[1],
    [childNodes],
  );

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

  const Icon = ICONS[props.type];

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames("card", "decision", {
          isDragging,
          isClone: isClone(props.id),
          isNote: childNodes.length === 0,
          wasVisited: props.wasVisited,
        })}
      >
        <Link
          href={href}
          prefetch={false}
          onContextMenu={handleContext}
          ref={drag}
        >
          {Icon && <Icon />}
          <span>{props.text}</span>
        </Link>
        {groupedOptions ? (
          <ol className="categories">
            {groupedOptions.map(({ title, children }, i) => (
              <li key={i} className="card category">
                <span>{title}</span>
                <ol className="options">
                  {children.map((child: any) => (
                    <Node key={child.id} {...child} />
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        ) : (
          <ol className="options">
            {childNodes.map((child: any) => (
              <Node key={child.id} {...child} />
            ))}
          </ol>
        )}
      </li>
    </>
  );
});

export default Checklist;
