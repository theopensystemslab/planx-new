import {
  ComponentType as TYPES,
  DEFAULT_FLAG_CATEGORY,
} from "@opensystemslab/planx-core/types";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { exhaustiveCheck } from "utils";

import { Store, useStore } from "../../../lib/store";
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
    tags: node.data?.tags,
    isTemplatedNode: node.data?.isTemplatedNode,
    templatedNodeInstructions: node.data?.templatedNodeInstructions,
    areTemplatedNodeInsructionsRequired:
      node.data?.areTemplatedNodeInstructionsRequired,
    className: props.className || "",
  };

  const type = props.type as TYPES;
  switch (type) {
    case TYPES.Calculate:
      return <Question {...allProps} text={node.data?.title || "Calculate"} />;
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
    case TYPES.Feedback:
      return <Question {...allProps} text={node?.data?.title ?? "Feedback"} />;
    case TYPES.FileUpload:
      return (
        <Question {...allProps} text={node?.data?.title ?? "File upload"} />
      );
    case TYPES.FileUploadAndLabel:
      return (
        <Question
          {...allProps}
          text={node?.data?.title ?? "Upload and label"}
        />
      );
    case TYPES.Filter:
      return (
        <Filter
          {...allProps}
          text={`Filter - ${node?.data?.category || DEFAULT_FLAG_CATEGORY}`}
        />
      );
    case TYPES.FindProperty:
      return <Question {...allProps} text="Find property" />;
    case TYPES.List:
      return <Question {...allProps} text={node?.data?.title ?? "List"} />;
    case TYPES.MapAndLabel:
      return (
        <Question {...allProps} text={node?.data?.title ?? "Map and Label"} />
      );
    case TYPES.NextSteps:
      return <Question {...allProps} text="Next steps" />;
    case TYPES.Notice:
      return <Question {...allProps} text={node?.data?.title ?? "Notice"} />;
    case TYPES.NumberInput:
      return <Question {...allProps} text={node?.data?.title ?? "Number"} />;
    case TYPES.Page:
      return <Question {...allProps} text={node?.data?.title ?? "Page"} />;
    case TYPES.Pay:
      return <Question {...allProps} text={node?.data?.title ?? "Pay"} />;
    case TYPES.PlanningConstraints:
      return (
        <Question
          {...allProps}
          text={node?.data?.title ?? "Planning constraints"}
        />
      );
    case TYPES.PropertyInformation:
      return (
        <Question
          {...allProps}
          text={node?.data?.title ?? "Property information"}
        />
      );
    case TYPES.Result:
      return (
        <Question
          {...allProps}
          text={
            node?.data?.flagSet ? `Result - ${node.data.flagSet}` : `Result`
          }
        />
      );
    case TYPES.Review:
      return <Question {...allProps} text={node?.data?.title ?? "Review"} />;
    case TYPES.Section:
      return (
        <Question {...allProps} text={node?.data?.title ?? "Section marker"} />
      );
    case TYPES.Send:
      return <Question {...allProps} text={node?.data?.title ?? "Send"} />;
    case TYPES.SetFee:
      return <Question {...allProps} text={"Set fees"} />;
    case TYPES.SetValue:
      return <Question {...allProps} text={getSetValueText(node.data)} />;
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

    case TYPES.Answer:
      return <Option {...allProps} />;
    case TYPES.Question:
    case TYPES.ResponsiveQuestion:
    case TYPES.Checklist:
    case TYPES.ResponsiveChecklist:
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
    case TYPES.Flow:
      return null;
    default:
      console.error({ nodeNotFound: props });
      return exhaustiveCheck(type);
  }
};

const getSetValueText = ({ operation, fn, val }: Store.Node["data"] = {}) => {
  switch (operation) {
    case "append":
      return `Append ${val} to ${fn}`;
    case "removeOne":
      return `Remove ${val} from ${fn}`;
    case "removeAll":
      return `Remove ${fn}`;
    default:
      return `Replace ${fn} with ${val}`;
  }
};

export default function SafeNode(props: any) {
  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <Question
          hasFailed
          type="Error"
          id={props.id}
          text="Corrupted"
          lockedFlow
          showTemplatedNodeStatus
        />
      )}
    >
      <Node {...props} />
    </ErrorBoundary>
  );
}
