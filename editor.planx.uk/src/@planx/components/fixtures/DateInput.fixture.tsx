import React from "react";

import Editor from "../DateInput/Editor";
import Public from "../DateInput/Public";
import Wrapper from "./Wrapper";

export default () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
