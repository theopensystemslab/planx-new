import Help from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import { Link } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import classNames from "classnames";
import { useContextMenu } from "hooks/useContextMenu";
import mapAccum from "ramda/src/mapAccum";
import React, { useMemo } from "react";
import { useDrag } from "react-dnd";
import { TemplatedNodeContainer } from "ui/editor/TemplatedNodeContainer";

import { useStore } from "../../../lib/store";
import { useFlowNotes } from "../lib/flowNotesContext";
import { getParentId } from "../lib/utils";
import AttachedNotes from "./AttachedNotes";
import { DataField } from "./DataField";
import Hanger from "./Hanger";
import Node from "./Node";
import { Tag } from "./Tag";
import { Thumbnail } from "./Thumbnail";

type Props = {
  type: TYPES;
  [key: string]: any;
  wasVisited?: boolean;
  showTemplatedNodeStatus: boolean;
};

const Checklist: React.FC<Props> = React.memo((props) => {
  const [isClone, childNodes, showHelpText, showTags, showNotes] = useStore(
    (state) => [
      state.isClone,
      state.childNodesOf(props.id),
      state.showHelpText,
      state.showTags,
      state.showNotes,
    ],
  );

  const { notesForNode } = useFlowNotes();

  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });

  const parent = getParentId(props.parent);

  // Attached notes are grouped with and rendered on their sibling node
  const isAttachedNote =
    childNodes.length === 0 && props.data?.placement === "attached";

  // Standalone/legacy notes render inline in the flow with the original sticky note styling
  const isStandaloneNote =
    childNodes.length === 0 && props.data?.placement !== "attached";

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

  const handleContextMenu = useContextMenu({
    source: "node",
    relationships: {
      parent,
      before: props.id,
      self: props.id,
    },
  });

  const Icon = ICONS[props.type];

  const hasHelpText =
    props.data?.policyRef || props.data?.info || props.data?.howMeasured;

  if (isAttachedNote) return null;
  if (isStandaloneNote && !showNotes) return null;

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames("card", "decision", "question", {
          isDragging,
          isClone: isClone(props.id),
          isNote: isStandaloneNote,
          wasVisited: props.wasVisited,
        })}
      >
        <TemplatedNodeContainer
          isTemplatedNode={props.data?.isTemplatedNode}
          areTemplatedNodeInstructionsRequired={
            props.data?.areTemplatedNodeInstructionsRequired
          }
          showStatus={props.showTemplatedNodeStatus}
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
            ref={(el) => {
              drag(el);
            }}
          >
            {props.data?.img && (
              <Thumbnail
                imageSource={props.data?.img}
                imageAltText={props.data?.text}
              />
            )}
            <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
              {Icon && !isAttachedNote && !isStandaloneNote && <Icon />}
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
          <AttachedNotes notes={notesForNode(props.id)} parentId={parent} />
        </TemplatedNodeContainer>
        {groupedOptions ? (
          <ol className="categories">
            {groupedOptions.map(({ title, children }, i) => (
              <li key={i} className="card category">
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
                  hash={`group-${i}`}
                >
                  {title}
                </Link>
                <ol className="options">
                  {children.map((child) => (
                    <Node
                      parent={props.id}
                      key={child.id}
                      {...child}
                      showTemplatedNodeStatus={props.showTemplatedNodeStatus}
                    />
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        ) : (
          <ol className="options">
            {childNodes.map((node) => (
              <Node
                parent={props.id}
                key={node.id}
                {...node}
                showTemplatedNodeStatus={props.showTemplatedNodeStatus}
              />
            ))}
          </ol>
        )}
      </li>
    </>
  );
});

export default Checklist;
