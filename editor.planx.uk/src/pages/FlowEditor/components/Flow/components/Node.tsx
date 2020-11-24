import { TYPES } from "@planx/components/types";
import React from "react";

import { useStore } from "../../../lib/store";
import Breadcrumb from "./Breadcrumb";
import Checklist from "./Checklist";
import Filter from "./Filter";
import Option from "./Option";
import Page from "./Page";
import Portal from "./Portal";
import Question from "./Question";

const Node: React.FC<any> = (props) => {
  const node = useStore((state) => state.flow[props.id]);
  const type = props.type as TYPES;
  switch (type) {
    case TYPES.Content:
      return <Question {...props} text={"Content"} />;
    case TYPES.DateInput:
      return <Question {...props} text="Date" />;
    case TYPES.ExternalPortal:
      return <Portal {...props} />;
    case TYPES.InternalPortal:
      return props.href ? <Breadcrumb {...props} /> : <Portal {...props} />;
    case TYPES.FileUpload:
      return (
        <Question {...props} text={node?.data?.description ?? "File Upload"} />
      );
    case TYPES.Filter:
      return <Filter {...props} text="(Flags Filter)" />;
    case TYPES.FindProperty:
      return <Question {...props} text="Find property" />;
    case TYPES.Notice:
      return <Question {...props} text="Notice" />;
    case TYPES.Page:
      return <Page {...props} text={node?.data?.title ?? "Page"} />;
    case TYPES.Pay:
      return <Question {...props} text={node?.data?.description ?? "Pay"} />;
    case TYPES.PropertyInformation:
      return <Question {...props} text="Property information" />;
    case TYPES.Result:
      return <Question {...props} text="(Result)" />;
    case TYPES.Review:
      return <Question {...props} text={node?.data?.description ?? "Review"} />;
    case TYPES.TaskList:
      return (
        <Question
          {...props}
          text={`Tasks (${node.data?.tasks?.length || 0})`}
        />
      );
    case TYPES.TextInput:
      return <Question {...props} text="Text" />;

    case TYPES.Response:
      return <Option {...props} />;
    case TYPES.Statement:
    case TYPES.Checklist:
      return (
        <Checklist {...props} {...node} text={node?.data?.text ?? "[Empty]"} />
      );
    case TYPES.AddressInput:
    case TYPES.Flow:
    case TYPES.NumberInput:
    case TYPES.Report:

    case TYPES.SignIn:
      return null;
    default:
      console.error({ nodeNotFound: props });
      return exhaustiveCheck(type);
  }
};

function exhaustiveCheck(type: never): never {
  throw new Error("Missing type");
}

export default Node;
