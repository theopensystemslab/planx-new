import React from "react";

import Editor from "../Notice/Editor";
import Public from "../Notice/Public";
import Wrapper from "./Wrapper";

export default () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
