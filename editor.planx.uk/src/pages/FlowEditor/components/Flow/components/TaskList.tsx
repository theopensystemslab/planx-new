import React from "react";
import { Link } from "react-navi";

interface Props {
  id: string;
  parent?: string;
}

const TaskList: React.FC<Props> = (props) => {
  const href = props.parent
    ? `${window.location.pathname}/nodes/${props.parent}/nodes/${props.id}/edit`
    : `${window.location.pathname}/nodes/${props.id}/edit`;
  return <Link href={href}>Task List</Link>;
};

export default TaskList;
