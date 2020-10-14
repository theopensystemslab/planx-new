import React from "react";
import { flowDirection } from "../config";

const Flow = ({ children }) => {
  return (
    <ol id="flow" data-layout={flowDirection}>
      {children}
    </ol>
  );
};

export default Flow;
