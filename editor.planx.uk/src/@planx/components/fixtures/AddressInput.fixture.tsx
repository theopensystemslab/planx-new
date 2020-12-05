import React from "react";

import Editor from "../AddressInput/Editor";
import Public from "../AddressInput/Public";
import Wrapper from "./Wrapper";

export default () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
