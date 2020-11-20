import React from "react";

import Editor from "../Content/Editor";
import Public from "../Content/Public";
import Wrapper from "./Wrapper";

export default () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
