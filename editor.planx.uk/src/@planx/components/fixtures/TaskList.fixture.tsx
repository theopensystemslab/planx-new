import React from "react";

import Editor from "../TaskList/Editor";
import Public from "../TaskList/Public";
import Wrapper from "./Wrapper";

export default () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
