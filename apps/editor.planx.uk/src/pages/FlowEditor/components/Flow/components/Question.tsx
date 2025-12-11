import ErrorIcon from "@mui/icons-material/Error";
import Help from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import classNames from "classnames";
import { useContextMenu } from "hooks/useContextMenu";
import React from "react";
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
  type: TYPES | "Error";
  [key: string]: any;
  wasVisited?: boolean;
  showTemplatedNodeStatus: boolean;
};

const Question: React.FC<Props> = React.memo((props) => {
  const [isClone, childNodes, showHelpText, showTags] = useStore((state) => [
    state.isClone,
    state.childNodesOf(props.id),
    state.showHelpText,
    state.showTags,
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

  const handleContextMenu = useContextMenu({
    source: "node",
    relationships: {
      parent,
      before: props.id,
      self: props.id,
    },
  });

  const Icon = props.type === "Error" ? ErrorIcon : ICONS[props.type];
  // If there is an error, the icon has a semantic meaning and needs a title
  const iconTitleAccess = props.type === "Error" ? "Error" : undefined;

  const hasHelpText =
    props.data?.policyRef || props.data?.info || props.data?.howMeasured;

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames(
          "card",
          "decision",
          "type-" + TYPES[props.type as TYPES],
          {
            isDragging,
            isClone: isClone(props.id),
            wasVisited: props.wasVisited,
            hasFailed: props.hasFailed,
          },
        )}
      >
        <TemplatedNodeContainer
          isTemplatedNode={props.data?.isTemplatedNode}
          areTemplatedNodeInstructionsRequired={
            props.data?.areTemplatedNodeInstructionsRequired
          }
          showStatus={props.showTemplatedNodeStatus}
        >
          <Link
            href={href}
            prefetch={false}
            onContextMenu={handleContextMenu}
            ref={drag}
          >
            {props.data?.img && (
              <Thumbnail
                imageSource={props.data?.img}
                imageAltText={props.data?.text}
              />
            )}
            <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
              {Icon && <Icon titleAccess={iconTitleAccess} />}
              <span>{props.text}</span>
              {showHelpText && hasHelpText && (
                <Help fontSize="small" sx={{ marginLeft: "auto" }} />
              )}
            </Box>
          </Link>
          {props.type !== TYPES.SetValue && props.data?.fn && (
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
        <ol className="options">
          {childNodes.map((child: any) => (
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

export default Question;
