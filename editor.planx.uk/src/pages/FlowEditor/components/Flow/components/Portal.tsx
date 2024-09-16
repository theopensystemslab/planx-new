import { useQuery } from "@apollo/client";
import MoreVert from "@mui/icons-material/MoreVert";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import classNames from "classnames";
import gql from "graphql-tag";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-navi";

import { rootFlowPath } from "../../../../../routes/utils";
import { getParentId } from "../lib/utils";
import Hanger from "./Hanger";
import Question from "./Question";

const ExternalPortal: React.FC<any> = (props) => {
  const [href, setHref] = useState("Loading...");

  const addExternalPortal = useStore.getState().addExternalPortal;

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
      <li className={classNames("card", "portal", { isDragging })}>
        <Link href={`/${href}`} prefetch={false} ref={drag}>
          <span>{href}</span>
        </Link>
        <Link href={editHref} prefetch={false} className="portalMenu">
          <MoreVert titleAccess="Edit Portal" />
        </Link>
      </li>
    </>
  );
};

const InternalPortal: React.FC<any> = (props) => {
  const href = props.data.href || `${rootFlowPath(true)},${props.id}`;

  const parent = getParentId(props.parent);

  const copyNode = useStore((state) => state.copyNode);

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

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li className={classNames("card", "portal", { isDragging })}>
        <Link
          href={href}
          prefetch={false}
          ref={drag}
          onContextMenu={handleContext}
        >
          {Icon && <Icon />}
          <span>{props.data.text}</span>
        </Link>
        <Link href={editHref} prefetch={false} className="portalMenu">
          <MoreVert titleAccess="Edit Portal" />
        </Link>
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
