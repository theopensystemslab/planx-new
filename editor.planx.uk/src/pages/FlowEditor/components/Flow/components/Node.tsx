import React from "react";
import { TYPES } from "../../../data/types";
import { useStore } from "../../../lib/store";
import Breadcrumb from "./Breadcrumb";
import Option from "./Option";
import Portal from "./Portal";
import Question from "./Question";

const Node: React.FC<any> = (props) => {
  const node = useStore((state) => state.flow.nodes[props.id]);

  switch (props.$t) {
    case TYPES.PropertyInformation:
      return <Question {...props} text="Property information" />;
    case TYPES.FindProperty:
      return <Question {...props} text="Find property" />;
    case TYPES.TaskList:
      return (
        <Question {...props} text={`${node.taskList.tasks.length} tasks`} />
      );
    case TYPES.Statement:
    case TYPES.Checklist:
      return <Question {...props} {...node} />;
    case TYPES.Response:
      return <Option {...props} />;
    // case TYPES.PropertyInformation:
    //   return <Question {...props} text="Property information" />;
    // case TYPES.FindProperty:
    //   return <Question {...props} text="Find property" />;
    case TYPES.Portal:
      return props.href ? <Breadcrumb {...props} /> : <Portal {...props} />;
    // case undefined:
    //   return <Option {...props} />;
    default:
      console.error({ nodeNotFound: props });
      return null;
  }
};

export default Node;
