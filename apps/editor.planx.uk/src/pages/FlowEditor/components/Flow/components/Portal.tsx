import { useQuery } from "@apollo/client";
import MoreVert from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import { NodeTag } from "@opensystemslab/planx-core/types";
import { Link } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import classNames from "classnames";
import gql from "graphql-tag";
import { useContextMenu } from "hooks/useContextMenu";
import useScrollOnPreviousURLMatch from "hooks/useScrollOnPreviousURLMatch";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { TemplatedNodeContainer } from "ui/editor/TemplatedNodeContainer";
import EditorIcon from "ui/icons/Editor";
import { rootFlowPath } from "utils/routeUtils/utils";

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

  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });

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
    },
  );

  // Construct and store external portal details
  useEffect(() => {
    if (!data) return;

    const href = [data.flows_by_pk.team.slug, data.flows_by_pk.slug].join("/");
    setHref(href);
    addExternalPortal({
      id: props.data.flowId,
      name: data.flows_by_pk.name,
      href,
    });
  }, [data, addExternalPortal, props.data.flowId]);

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
        showTemplatedNodeStatus={props.showTemplatedNodeStatus}
      />
    );
  }

  const internalTeamSlug = data?.flows_by_pk?.team?.slug;
  const internalFlowSlug = data?.flows_by_pk?.slug;

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li ref={ref}>
        <Box
          data-loading={href === "Loading..."}
          className={classNames("card", "portal", "external-portal", {
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
              {internalTeamSlug && internalFlowSlug ? (
                <Link
                  to="/app/$team/$flow"
                  params={{
                    team: internalTeamSlug,
                    flow: internalFlowSlug,
                  }}
                  preload={false}
                  ref={drag}
                >
                  <EditorIcon />
                  <span>{href}</span>
                </Link>
              ) : (
                <span ref={drag}>
                  <EditorIcon />
                  <span>{href}</span>
                </span>
              )}
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
                className="portalMenu"
              >
                <MoreVert titleAccess="Edit Portal" />
              </Link>
            </Box>
          </TemplatedNodeContainer>
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

  const { isClone, showTags } = useStore((state) => ({
    isClone: state.isClone,
    showTags: state.showTags,
  }));

  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });

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

  const handleContextMenu = useContextMenu({
    source: "node",
    relationships: {
      parent,
      before: props.id,
      self: props.id,
    },
  });

  const ref = useScrollOnPreviousURLMatch<HTMLLIElement>(props.id);

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li
        className={classNames("folder", {
          isClone: isClone(props.id),
        })}
        ref={ref}
      >
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
                to={href}
                preload={false}
                ref={drag}
                onContextMenu={handleContextMenu}
              >
                <span>{props.data.text}</span>
              </Link>
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
                className="portalMenu"
              >
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
