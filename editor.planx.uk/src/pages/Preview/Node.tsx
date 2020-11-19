import Content from "@planx/components/Content/Public";
import DateInput from "@planx/components/DateInput/Public";
import Notice from "@planx/components/Notice/Public";
import TaskList from "@planx/components/TaskList/Public";
import TextInput from "@planx/components/TextInput/Public";
import { TYPES } from "@planx/components/types";
import mapAccum from "ramda/src/mapAccum";
import React from "react";

import { componentOutput, node, useStore } from "../FlowEditor/lib/store";
import Checklist from "./components/Checklist";
import FileUpload from "./components/FileUpload";
import FindProperty from "./components/FindProperty";
import Pay from "./components/Pay";
import PropertyInformation from "./components/PropertyInformation";
import Question from "./components/Question";
import Result from "./components/Result";
import Review from "./components/Review";

let uprn;

export type handleSubmit = (_?: componentOutput) => void;
interface Props {
  handleSubmit: handleSubmit;
  node: node;
}

const Node: React.FC<any> = (props: Props) => {
  const [childNodesOf, reportData] = useStore((state) => [
    state.childNodesOf,
    state.reportData,
  ]);

  const resetPreview = useStore((state) => state.resetPreview);

  const allProps = {
    ...props.node.data,
    resetPreview,
    handleSubmit: props.handleSubmit,
  };

  switch (props.node.type) {
    case TYPES.Checklist:
      const childNodes = childNodesOf(props.node.id);
      return (
        <Checklist
          {...allProps}
          options={allProps.categories ? undefined : childNodes}
          groupedOptions={
            !allProps.categories
              ? undefined
              : mapAccum(
                  (
                    index: number,
                    category: { title: string; count: number }
                  ) => [
                    index + category.count,
                    {
                      title: category.title,
                      children: childNodes.slice(index, index + category.count),
                    },
                  ],
                  0,
                  allProps.categories
                )[1]
          }
        />
      );

    case TYPES.Content:
      return <Content {...allProps} />;

    case TYPES.FileUpload:
      return <FileUpload {...allProps} />;

    case TYPES.FindProperty:
      return (
        <FindProperty
          handleSubmit={(data) => {
            uprn = data;
            props.handleSubmit([props.node.id]);
          }}
        />
      );

    case TYPES.Notice:
      return (
        <Notice
          {...allProps}
          handleSubmit={() => props.handleSubmit([props.node.id])}
        />
      );

    case TYPES.Pay:
      return (
        <Pay
          {...allProps}
          handleSubmit={() => props.handleSubmit([props.node.id])}
        />
      );

    case TYPES.PropertyInformation:
      return (
        <PropertyInformation
          UPRN={uprn}
          handleSubmit={() => props.handleSubmit([props.node.id])}
        />
      );

    case TYPES.Result:
      const data = reportData();

      const { flag, responses } = data["Planning permission"];

      return (
        <Result
          handleSubmit={() => props.handleSubmit([props.node.id])}
          headingColor={{
            text: flag.color,
            background: flag.bgColor,
          }}
          headingTitle={flag.text}
          subheading=""
          reasonsTitle="Responses"
          responses={responses}
        />
      );

    case TYPES.Review:
      return (
        <Review
          {...allProps}
          handleSubmit={() => props.handleSubmit([props.node.id])}
        />
      );

    case TYPES.Statement:
      return (
        <Question
          {...allProps}
          responses={childNodesOf(props.node.id).map((n, i) => ({
            id: n.id,
            responseKey: i + 1,
            title: n.data?.text,
          }))}
        />
      );

    case TYPES.TaskList:
      return (
        <TaskList
          {...allProps}
          tasks={
            // Remove once migrated
            allProps.taskList?.tasks || allProps.tasks
          }
        />
      );

    case TYPES.TextInput:
      return <TextInput {...allProps} />;

    case TYPES.DateInput:
      return <DateInput {...allProps} />;

    case TYPES.AddressInput:
    case TYPES.DateInput:
    case TYPES.ExternalPortal:
    case TYPES.Filter:
    case TYPES.Flow:
    case TYPES.InternalPortal:
    case TYPES.NumberInput:
    case TYPES.Page:
    case TYPES.Report:
    case TYPES.Response:
    case TYPES.SignIn:
      return null;
    default:
      console.error({ nodeNotFound: props });
      return exhaustiveCheck(props.node.type);
  }
};

function exhaustiveCheck(type: never): never {
  throw new Error("Missing type");
}

export default Node;
