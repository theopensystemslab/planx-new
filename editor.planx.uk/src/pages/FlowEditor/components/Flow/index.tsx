import React from "react";
import Hanger from "./components/Hanger";

const Flow = () => {
  return (
    <ol id="flow" data-layout="top-down">
      <Hanger />
      <Hanger />
      <Hanger />
      <Hanger />
    </ol>
  );
};

export default Flow;
