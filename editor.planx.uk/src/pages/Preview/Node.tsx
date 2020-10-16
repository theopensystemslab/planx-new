import mapAccum from "ramda/src/mapAccum";
import React from "react";

import { TYPES } from "../FlowEditor/data/types";
import { useStore } from "../FlowEditor/lib/store";
import Checklist from "./components/Checklist";
import Content from "./components/Content";
import FindProperty from "./components/FindProperty";
import Notice from "./components/Notice";
import PropertyInformation from "./components/PropertyInformation";
import Question from "./components/Question";
import Result from "./components/Result";
import TaskList from "./components/TaskList";

let uprn;

const Node: React.FC<any> = (props) => {
  const [childNodesOf, flagResult, responsesForReport] = useStore((state) => [
    state.childNodesOf,
    state.flagResult,
    state.responsesForReport,
  ]);

  switch (props.$t) {
    // check SUPPORTED_TYPES in store
    case TYPES.Statement:
      return (
        <Question
          handleClick={props.handleSubmit}
          description={props.description}
          title={props.text}
          info={props.info}
          responses={childNodesOf(props.id).map((n, i) => ({
            id: n.id,
            responseKey: i + 1,
            title: n.text,
          }))}
        />
      );
    case TYPES.Result:
      const flag = flagResult();

      return (
        <Result
          handleSubmit={props.handleSubmit}
          headingColor={{
            text: flag.color.toHexString(),
            background: flag.bgColor,
          }}
          headingTitle={flag.text}
          subheading=""
          reasonsTitle="Responses"
          responses={[
            {
              "Planning permission": responsesForReport(),
            },
          ]}
        />
      );
    case TYPES.TaskList:
      return (
        <TaskList
          node={props.node}
          tasks={props.taskList.tasks}
          handleSubmit={props.handleSubmit}
        />
      );
    case TYPES.Notice:
      return <Notice {...props} handleSubmit={props.handleSubmit} />;
    case TYPES.Content:
      return <Content {...props} handleSubmit={props.handleSubmit} />;
    case TYPES.Checklist:
      const childNodes = childNodesOf(props.node.id);
      return (
        <Checklist
          info={props.info}
          text={props.text}
          description={props.description}
          allRequired={props.allRequired}
          handleSubmit={props.handleSubmit}
          options={props.node.categories ? undefined : childNodes}
          groupedOptions={
            !props.node.categories
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
                  props.node.categories
                )[1]
          }
        />
      );
    case TYPES.FindProperty:
      return (
        <FindProperty
          handleSubmit={(data) => {
            uprn = data;
            props.handleSubmit([props.id]);
          }}
        />
      );
    case TYPES.PropertyInformation:
      return (
        <PropertyInformation
          UPRN={uprn}
          handleSubmit={() => props.handleSubmit([props.id])}
        />
      );
    default:
      console.error({ nodeNotFound: props });
      return null;
  }
};

export default Node;
