import { useQuery } from "@apollo/client";
import classNames from "classnames";
import gql from "graphql-tag";
import React from "react";
import { useDrag } from "react-dnd";
import MoreVertical from "react-feather/dist/icons/more-vertical";
import { Link } from "react-navi";
import { rootFlowPath } from "../../../../../routes/utils";
import { getParentId } from "../../../lib/utils";
import Hanger from "./Hanger";

const ExternalPortal: React.FC<any> = React.memo(
  (props) => {
    const { data } = useQuery(
      gql`
        query GetFlow($id: uuid!) {
          flows_by_pk(id: $id) {
            slug
            team {
              slug
            }
          }
        }
      `,
      { variables: { id: props.flowId } }
    );

    const parent = getParentId(props.parent);

    const [{ isDragging }, drag] = useDrag({
      item: {
        id: props.id,
        parent,
        text: props.text,
        type: "PORTAL",
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    if (!data?.flows_by_pk) {
      return null;
    }

    const href = [data.flows_by_pk.team.slug, data.flows_by_pk.slug].join("/");

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
          <Link href={editHref} prefetch={false}>
            <MoreVertical />
          </Link>
        </li>
      </>
    );
  },
  (a, b) => a.flowId === b.flowId
);

const InternalPortal: React.FC<any> = (props) => {
  let href = props.href || `${rootFlowPath(true)},${props.id}`;

  const parent = getParentId(props.parent);

  let editHref = `${window.location.pathname}/nodes/${props.id}/edit`;
  if (parent) {
    editHref = `${window.location.pathname}/nodes/${parent}/nodes/${props.id}/edit`;
  }

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: props.id,
      parent,
      text: props.text,
      type: "PORTAL",
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <>
      <Hanger hidden={isDragging} before={props.id} parent={parent} />
      <li className={classNames("card", "portal", { isDragging })}>
        <Link href={href} prefetch={false} ref={drag}>
          <span>{props.text}</span>
        </Link>
        <Link href={editHref} prefetch={false}>
          <MoreVertical />
        </Link>
      </li>
    </>
  );
};

const Portal: React.FC<any> = (props) => {
  if (props.flowId) {
    return <ExternalPortal {...props} />;
  } else {
    return <InternalPortal {...props} />;
  }
};

export default Portal;
