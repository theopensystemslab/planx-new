import React from "react";
import { TYPES } from "../FlowEditor/lib/flow";
import { useStore } from "../FlowEditor/lib/store";
import Question from "./components/Question";
// import Checklist from "./components/Checklist";
// import FindProperty from "./components/FindProperty";
// import PropertyInformation from "./components/PropertyInformation";

// let uprn;

const Node: React.FC<any> = (props) => {
  const childNodesOf = useStore((state) => state.childNodesOf);

  switch (props.$t) {
    case TYPES.Statement:
      return (
        <Question
          handleClick={props.handleSubmit}
          description={props.description}
          title={props.text}
          responses={childNodesOf(props.id).map((n, i) => ({
            id: n.id,
            responseKey: i + 1,
            title: n.text,
          }))}
        />
      );
    // case TYPES.FindProperty:
    //   return (
    //     <FindProperty
    //       handleSubmit={(data) => {
    //         uprn = data;
    //         props.handleSubmit([props.id]);
    //       }}
    //     />
    //   );
    // case TYPES.PropertyInformation:
    //   return (
    //     <PropertyInformation
    //       UPRN={uprn}
    //       handleSubmit={() => props.handleSubmit([props.id])}
    //     />
    //   );
    // case TYPES.Checklist:
    //   return (
    //     <Checklist
    //       text={props.text}
    //       description={props.description}
    //       handleSubmit={props.handleSubmit}
    //       checkBoxes={childNodesOf(props.id).map((n, i) => ({
    //         id: n.id,
    //         name: n.text,
    //       }))}
    //     />
    //   );
    default:
      console.error({ nodeNotFound: props });
      return null;
  }
};

export default Node;
