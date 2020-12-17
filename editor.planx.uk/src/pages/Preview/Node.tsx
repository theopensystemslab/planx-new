import AddressInput from "@planx/components/AddressInput/Public";
import Checklist from "@planx/components/Checklist/Public";
import Content from "@planx/components/Content/Public";
import DateInput from "@planx/components/DateInput/Public";
import FileUpload from "@planx/components/FileUpload/Public";
import FindProperty from "@planx/components/FindProperty/Public";
import Notice from "@planx/components/Notice/Public";
import NumberInput from "@planx/components/NumberInput/Public";
import PageWithSections from "@planx/components/PageWithSections/Public";
import Pay from "@planx/components/Pay/Public";
import PropertyInformation from "@planx/components/PropertyInformation/Public";
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

let uprn;

export type handleSubmit = (_?: componentOutput) => void;
interface Props {
  handleSubmit: handleSubmit;
  node: node;
}

const Node: React.FC<any> = (props: Props) => {
  const [
    childNodesOf,
    reportData,
    flow,
    setPage,
    breadcrumbs,
    record,
  ] = useStore((state) => [
    state.childNodesOf,
    state.reportData,
    state.flow,
    state.setPage,
    state.breadcrumbs,
    state.record,
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

    case TYPES.DateInput:
      return <DateInput {...allProps} />;

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

    case TYPES.NumberInput:
      return (
        <NumberInput
          {...allProps}
          handleSubmit={() => props.handleSubmit([props.node.id])}
        />
      );

    case TYPES.Page:
      return null;
    // const children = (props.node as any).children.map((id) => ({
    //   id,
    //   ...flow[id],
    // }));

    // return (
    //   <Page {...allProps} />
    //     {children.map((node) => (
    //       <Node
    //         node={node}
    //         key={node.id}
    //         handleSubmit={(values: componentOutput) => {
    //           record(node.id, values);
    //         }}
    //       />
    //     ))}
    //   </Page>
    // );

    case TYPES.PageWithSections:
      // const s = sections(props.node.id);

      const sections = flow[props.node.id].edges.map((id) => {
        const node = flow[id];

        return {
          id,
          title: node.data.title,
          status: breadcrumbs[id] ? "complete" : "ready",
          handleClick: () => setPage(id),
        };
      });

      return (
        <PageWithSections
          {...allProps}
          sections={sections}
          isValid={sections.every((s) => s.status === "complete")}
          handleSubmit={() => record(props.node.id, [])}
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

    case TYPES.Send:
      return (
        <Send
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
