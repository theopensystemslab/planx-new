import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

export default () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
