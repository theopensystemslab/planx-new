import { TYPES } from "@planx/components/types";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useStore } from "../../../lib/store";
import { stripTagsAndLimitLength } from "../lib/utils";
import Breadcrumb from "./Breadcrumb";
import Checklist from "./Checklist";
import Filter from "./Filter";
import Option from "./Option";
import Portal from "./Portal";
import Question from "./Question";

const Node: React.FC<any> = (props) => {
  const [node, wasVisited] = useStore((state) => [
    state.flow[props.id],
    state.wasVisited(props.id),
  ]);

  const allProps = {
    ...props,
    wasVisited,
  };

  const type = props.type as TYPES;
  switch (type) {
    case TYPES.Calculate:
      return <Question {...allProps} text="Calculate" />;
    case TYPES.Confirmation:
      return <Question {...allProps} text="Confirmation" />;
    case TYPES.Content:
      return (
        <Question
          {...allProps}
          text={stripTagsAndLimitLength(node?.data?.content, "Content", 100)}
        />
      );
    case TYPES.DateInput:
      return <Question {...allProps} text={node?.data?.title ?? "Date"} />;
    case TYPES.DrawBoundary:
      return (
        <Question {...allProps} text={node?.data?.title ?? "Draw boundary"} />
      );
    case TYPES.ExternalPortal:
      return <Portal {...allProps} />;
    case TYPES.InternalPortal:
      return props.href ? (
        <Breadcrumb {...allProps} />
      ) : (
        <Portal {...allProps} />
      );
    case TYPES.FileUpload:
      return (
        <Question {...allProps} text={node?.data?.title ?? "File upload"} />
      );
    case TYPES.Filter:
      return <Filter {...allProps} text="(Flags Filter)" />;
    case TYPES.FindProperty:
      return <Question {...allProps} text="Find property" />;
    case TYPES.Notice:
      return <Question {...allProps} text={node?.data?.title ?? "Notice"} />;
    case TYPES.NumberInput:
      return <Question {...allProps} text={node?.data?.title ?? "Number"} />;
    case TYPES.Pay:
      return <Question {...allProps} text={node?.data?.title ?? "Pay"} />;
    case TYPES.PlanningConstraints:
      return (
        <Question
          {...allProps}
          text={node?.data?.title ?? "Planning constraints"}
        />
      );
    case TYPES.Result:
      return (
        <Question
          {...allProps}
          text={[node?.data?.flagSet ?? "Result"].join("")}
        />
      );
    case TYPES.Review:
      return <Question {...allProps} text={node?.data?.title ?? "Review"} />;
    case TYPES.Send:
      return <Question {...allProps} text={node?.data?.title ?? "Send"} />;
    case TYPES.SetValue:
      return (
        <Question
          {...allProps}
          text={`${node?.data?.fn} = ${node?.data?.val}`}
        />
      );
    case TYPES.TaskList:
      return (
        <Question
          {...allProps}
          text={`${node?.data?.title ?? "Tasks"} (${
            node.data?.tasks?.length || 0
          })`}
        />
      );
    case TYPES.TextInput:
      return (
        <Question {...allProps} text={node?.data?.title ?? "Text input"} />
      );

    case TYPES.Response:
      return <Option {...allProps} />;
    case TYPES.Statement:
    case TYPES.Checklist:
      return (
        <Checklist
          {...allProps}
          {...node}
          text={node?.data?.text ?? "[Empty]"}
        />
      );
    case TYPES.AddressInput:
      return <Question {...allProps} text={node?.data?.title ?? "Address"} />;
    case TYPES.ContactInput:
      return <Question {...allProps} text={node?.data?.title ?? "Contact"} />;
    case TYPES.PropertyInformation:
      return (
        <Question
          {...allProps}
          text={node?.data?.title ?? "Property information"}
        />
      );
    case TYPES.Flow:
      return null;
    default:
      console.error({ nodeNotFound: props });
      return exhaustiveCheck(type);
  }
};

function exhaustiveCheck(type: never): never {
  throw new Error(`Missing type ${type}`);
}

export default function SafeNode(props: any) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <Question hasFailed type="Error" id={props.id} text="Corrupted" />
      )}
    >
      <Node {...props} />
    </ErrorBoundary>
  );
}
