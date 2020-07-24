import React from "react";
import EndPoint from "./components/EndPoint";
import Hanger from "./components/Hanger";

export enum FlowLayout {
  TOP_DOWN = "top-down",
  LEFT_RIGHT = "left-right",
}

const Flow = () => {
  return (
    <ol id="flow" data-layout={FlowLayout.TOP_DOWN}>
      <EndPoint text="start" />
      <Hanger />
      <EndPoint text="end" />
    </ol>
  );
};

export default Flow;
