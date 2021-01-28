import AddressInput from "@planx/components/AddressInput/Public";
import Checklist from "@planx/components/Checklist/Public";
import Content from "@planx/components/Content/Public";
import DateInput from "@planx/components/DateInput/Public";
import FileUpload from "@planx/components/FileUpload/Public";
import FindProperty from "@planx/components/FindProperty/Public";
import Notice from "@planx/components/Notice/Public";
import Notify from "@planx/components/Notify/Public";
import NumberInput from "@planx/components/NumberInput/Public";
import Pay from "@planx/components/Pay/Public";
import Question from "@planx/components/Question/Public";
import Result from "@planx/components/Result/Public";
import Review from "@planx/components/Review/Public";
import Send from "@planx/components/Send/Public";
import TaskList from "@planx/components/TaskList/Public";
import TextInput from "@planx/components/TextInput/Public";
import { TYPES } from "@planx/components/types";
import mapAccum from "ramda/src/mapAccum";
import React from "react";
import { componentOutput, node, useStore } from "../FlowEditor/lib/store";

export type handleSubmit = (_?: componentOutput) => void;
interface Props {
  handleSubmit: handleSubmit;
  node: node;
  data?: any;
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
      // TODO: sensitive fix for strict mode
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

    case TYPES.DateInput:
      return <DateInput {...allProps} />;

    case TYPES.FileUpload:
      return <FileUpload {...allProps} />;

    case TYPES.FindProperty:
      return (
        <FindProperty
          handleSubmit={() => props.handleSubmit([props.node.id])}
        />
      );

    case TYPES.Notice:
      return (
        <Notice
          {...allProps}
          handleSubmit={() => props.handleSubmit([props.node.id])}
        />
      );

    case TYPES.Notify:
      return (
        <Notify
          {...allProps}
          handleSubmit={() => props.handleSubmit([props.node.id])}
        />
      );

    case TYPES.NumberInput:
      return (
        <NumberInput
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

    case TYPES.Result:
      const data = reportData(props.node.data.flagSet);

      const { flag, responses } = data[props.node.data.flagSet];

      return (
        <Result
          handleSubmit={() => props.handleSubmit([props.node.id])}
          headingColor={{
            text: flag.color,
            background: flag.bgColor,
          }}
          headingTitle={flag.text}
          subheading={props.node.data.flagSet}
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

    case TYPES.Send:
      return (
        <Send
          {...allProps}
          handleSubmit={() => props.handleSubmit([props.node.id])}
        />
      );

    case TYPES.Statement:
      // TODO: sensitive fix for strict mode
      return (
        <Question
          {...allProps}
          responses={childNodesOf(props.node.id).map((n, i) => ({
            id: n.id,
            responseKey: i + 1,
            title: n.data?.text,
            ...n.data,
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

    case TYPES.AddressInput:
      return <AddressInput {...allProps} />;

    case TYPES.ExternalPortal:
    case TYPES.Filter:
    case TYPES.Flow:
    case TYPES.InternalPortal:
    case TYPES.Page:
    case TYPES.Report:
    case TYPES.Response:
    case TYPES.SignIn:
    case undefined:
      return null;
    default:
      console.error({ nodeNotFound: props });
      return exhaustiveCheck(props.node.type);
  }
};

function exhaustiveCheck(type: never): never {
  throw new Error(`Missing type ${type}`);
}

export default Node;
