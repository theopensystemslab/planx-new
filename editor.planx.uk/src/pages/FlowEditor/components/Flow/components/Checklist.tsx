import Help from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import classNames from "classnames";
import mapAccum from "ramda/src/mapAccum";
import React, { useMemo } from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";
import { TemplatedNodeContainer } from "ui/editor/TemplatedNodeContainer";

import { useStore } from "../../../lib/store";
import { getParentId } from "../lib/utils";
import { DataField } from "./DataField";
import Hanger from "./Hanger";
import Node from "./Node";
import { Tag } from "./Tag";
import { Thumbnail } from "./Thumbnail";

type Props = {
  type: TYPES;
  [key: string]: any;
  wasVisited?: boolean;
};

const Checklist: React.FC<Props> = React.memo((props) => {
  const [
    isClone,
    childNodes,
    copyNode,
    showHelpText,
    showTags,
    showTemplateStatus,
  ] = useStore((state) => [
    state.isClone,
    state.childNodesOf(props.id),
    state.copyNode,
    state.showHelpText,
    state.showTags,
    state.showTemplateStatus,
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

  const hasHelpText =
    props.data?.policyRef || props.data?.info || props.data?.howMeasured;

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames("card", "decision", "question", {
          isDragging,
          isClone: isClone(props.id),
          isNote: childNodes.length === 0,
          wasVisited: props.wasVisited,
        })}
      >
        <TemplatedNodeContainer
          isTemplatedNode={props.data?.isTemplatedNode}
          areTemplatedNodeInstructionsRequired={
            props.data?.areTemplatedNodeInstructionsRequired
          }
          showStatusHeader={showTemplateStatus}
          className={classNames("card-wrapper", {
            "template-card": props.data?.isTemplatedNode,
          })}
        >
          <Link
            href={href}
            prefetch={false}
            onContextMenu={handleContext}
            ref={drag}
          >
            {props.data?.img && (
              <Thumbnail
                imageSource={props.data?.img}
                imageAltText={props.data?.text}
              />
            )}
            <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
              {Icon && <Icon />}
              <span>{props.text}</span>
              {showHelpText && hasHelpText && (
                <Help fontSize="small" sx={{ marginLeft: "auto" }} />
              )}
            </Box>
          </Link>
          {props.data?.fn && (
            <DataField value={props.data.fn} variant="parent" />
          )}
          {showTags && props.data?.tags?.length > 0 && (
            <Box className="card-tag-list">
              {props.data.tags.map((tag: NodeTag) => (
                <Tag tag={tag} key={tag} />
              ))}
            </Box>
          )}
        </TemplatedNodeContainer>
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
