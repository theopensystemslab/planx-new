import { useQuery } from "@apollo/client";
import MoreVert from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import { ComponentType, NodeTag } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import classNames from "classnames";
import gql from "graphql-tag";
import useScrollOnPreviousURLMatch from "hooks/useScrollOnPreviousURLMatch";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";
import { TemplatedNodeContainer } from "ui/editor/TemplatedNodeContainer";
import EditorIcon from "ui/icons/Editor";

import { rootFlowPath } from "../../../../../routes-navi/utils";
import { getParentId } from "../lib/utils";
import Hanger from "./Hanger";
import Question from "./Question";
import { Tag } from "./Tag";

const ExternalPortal: React.FC<any> = (props) => {
  const [href, setHref] = useState("Loading...");

  const ref = useScrollOnPreviousURLMatch<HTMLLIElement>(href);

  const { addExternalPortal, showTags } = useStore((state) => ({
    addExternalPortal: state.addExternalPortal,
    showTags: state.showTags,
  }));

  const { data, loading } = useQuery(
    gql`
      query GetExternalPortal($id: uuid!) {
        flows_by_pk(id: $id) {
          id
          slug
          name
          team {
            slug
          }
        }
      }
    `,
    {
      variables: { id: props.data.flowId },
      onCompleted: (data) => {
        const href = [data.flows_by_pk.team.slug, data.flows_by_pk.slug].join(
          "/",
        );
        setHref(href);
        addExternalPortal({
          id: props.data.flowId,
          name: data.flows_by_pk.name,
          href,
        });
      },
    },
  );

  const parent = getParentId(props.parent);

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: props.id,
      parent,
      text: props.data.text,
    },
    type: "PORTAL",
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // If the flow referenced by an external portal has been deleted (eg !data),
  //   still show a "Corrupted" node so that editors have a visual cue to "delete".
  //   Until deleted, the flow schema will still contain a node reference to this portal causing publishing to fail
  if (!loading && !data?.flows_by_pk) {
    return (
      <Question
        hasFailed
        type="Error"
        id={props.id}
        text="Corrupted external portal: flow no longer exists"
        lockedFlow
        showTemplatedNodeStatus
      />
    );
  }

  let editHref = `${window.location.pathname}/nodes/${props.id}/edit`;
  if (parent) {
    editHref = `${window.location.pathname}/nodes/${parent}/nodes/${props.id}/edit`;
  }

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li ref={ref}>
        <Box
          className={classNames("card", "portal", "external-portal", {
            isDragging,
          })}
        >
          <Box className="card-wrapper">
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Link href={`/${href}`} prefetch={false} ref={drag}>
                <EditorIcon />
                <span>{href}</span>
              </Link>
              <Link href={editHref} prefetch={false} className="portalMenu">
                <MoreVert titleAccess="Edit Portal" />
              </Link>
            </Box>
          </Box>
          {showTags && props.data?.tags?.length > 0 && (
            <Box className="card-tag-list">
              {props.data.tags.map((tag: NodeTag) => (
                <Tag tag={tag} key={tag} />
              ))}
            </Box>
          )}
        </Box>
      </li>
    </>
  );
};

const InternalPortal: React.FC<any> = (props) => {
  const href = props.data.href || `${rootFlowPath(true)},${props.id}`;

  const parent = getParentId(props.parent);

  const { copyNode, showTags } = useStore((state) => ({
    copyNode: state.copyNode,
    showTags: state.showTags,
  }));

  let editHref = `${window.location.pathname}/nodes/${props.id}/edit`;
  if (parent) {
    editHref = `${window.location.pathname}/nodes/${parent}/nodes/${props.id}/edit`;
  }

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: props.id,
      parent,
      text: props.data.text,
    },
    type: "PORTAL",
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleContext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copyNode(props.id);
  };

  const Icon = ICONS[ComponentType.InternalPortal];

  const ref = useScrollOnPreviousURLMatch<HTMLLIElement>(props.id);

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li ref={ref}>
        <Box
          className={classNames("card", "portal", "internal-portal", {
            isDragging,
          })}
        >
          <TemplatedNodeContainer
            isTemplatedNode={props.data?.isTemplatedNode}
            areTemplatedNodeInstructionsRequired={
              props.data?.areTemplatedNodeInstructionsRequired
            }
            showStatus={props.showTemplatedNodeStatus}
          >
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Link
                href={href}
                prefetch={false}
                ref={drag}
                onContextMenu={handleContext}
              >
                <span>{props.data.text}</span>
              </Link>
              <Link href={editHref} prefetch={false} className="portalMenu">
                <MoreVert titleAccess="Edit Portal" />
              </Link>
            </Box>
            {showTags && props.data?.tags?.length > 0 && (
              <Box className="card-tag-list">
                {props.data.tags.map((tag: NodeTag) => (
                  <Tag tag={tag} key={tag} />
                ))}
              </Box>
            )}
          </TemplatedNodeContainer>
        </Box>
      </li>
    </>
  );
};

const Portal: React.FC<any> = (props) => {
  if (props.data.flowId) {
    return <ExternalPortal {...props} />;
  } else {
    return <InternalPortal {...props} />;
  }
};

export default Portal;
