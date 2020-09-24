import React from "react";
import { TYPES } from "../FlowEditor/data/types";
import { useStore } from "../FlowEditor/lib/store";
import Checklist from "./components/Checklist";
import FindProperty from "./components/FindProperty";
import PropertyInformation from "./components/PropertyInformation";
import Question from "./components/Question";
import Result from "./components/Result";
import TaskList from "./components/TaskList";
import Notice from "./components/Notice";

let uprn;

const Node: React.FC<any> = (props) => {
  const childNodesOf = useStore((state) => state.childNodesOf);

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
      return (
        <Result
          handleSubmit={props.handleSubmit}
          headingColor={{ text: "#fff", background: "#FF5959" }}
          headingTitle="Heading"
          subheading="Subheading if used"
          reasonsTitle="Reasons"
          responses={[
            {
              "Issue tag 1": [
                {
                  text:
                    "Tag 1 Flagging question followed by <strong>answer</strong>",
                },
                {
                  text:
                    "Tag 1 Flagging question followed by <strong>answer</strong>",
                },
                {
                  text:
                    "Tag 1 Flagging question followed by <strong>answer</strong>",
                },
                {
                  text:
                    "Tag 1 Flagging question followed by <strong>answer</strong>",
                },
                {
                  text:
                    "Tag 1 Flagging question followed by <strong>answer</strong>",
                },
              ],
            },
            {
              "Issue tag 2": [
                {
                  text:
                    "Tag 2 Flagging question followed by <strong>answer</strong>",
                },
              ],
            },
            {
              "Issue tag 3": [
                {
                  text:
                    "Tag 3 Flagging question followed by <strong>answer</strong>",
                },
                {
                  text:
                    "Tag 3 Flagging question followed by <strong>answer</strong>",
                },
              ],
            },
          ]}
        />
      );
    case TYPES.TaskList:
      return (
        <TaskList
          tasks={props.taskList.tasks}
          handleSubmit={props.handleSubmit}
        />
      );
    case TYPES.Notice:
      return <Notice {...props} handleSubmit={props.handleSubmit} />;
    case TYPES.Checklist:
      return (
        <Checklist
          info={props.info}
          text={props.text}
          description={props.description}
          handleSubmit={props.handleSubmit}
          checkBoxes={childNodesOf(props.id).map((n, i) => ({
            id: n.id,
            name: n.text,
          }))}
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
