import React from "react";

import Editor from "../TextInput/Editor";
import Public from "../TextInput/Public";
import Wrapper from "./Wrapper";

export default () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
