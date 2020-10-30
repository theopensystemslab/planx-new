import React from "react";
import { TYPES } from "../../../data/types";
import { useStore } from "../../../lib/store";
import Breadcrumb from "./Breadcrumb";
import Option from "./Option";
import Portal from "./Portal";
import Question from "./Question";
import Result from "./Result";

const Node: React.FC<any> = (props) => {
  const node = useStore((state) => state.flow[props.id]);

  switch (props.type) {
    case TYPES.PropertyInformation:
      return <Question {...props} text="Property information" />;
    case TYPES.FindProperty:
      return <Question {...props} text="Find property" />;
    case TYPES.Result:
      return <Result {...props} text="RESULT" />;
    case TYPES.TaskList:
      return (
        <Question
          {...props}
          text={`Tasks (${node.data?.taskList?.tasks?.length || 0})`}
        />
      );
    case TYPES.TextInput:
      return <Question {...props} text="Text" />;
    case TYPES.Notice:
      return <Question {...props} text={"Notice"} />;
    case TYPES.FileUpload:
      return (
        <Question {...props} text={node?.data?.description ?? "File Upload"} />
      );
    case TYPES.Content:
      return <Question {...props} text={"Content"} />;
    case TYPES.Statement:
    case TYPES.Checklist:
      return (
        <Question {...props} {...node} text={node?.data?.text ?? "[Empty]"} />
      );
    case TYPES.Response:
      return <Option {...props} />;
    case TYPES.Portal:
      return props.href ? <Breadcrumb {...props} /> : <Portal {...props} />;
    default:
      console.error({ nodeNotFound: props });
      return null;
  }
};

export default Node;
