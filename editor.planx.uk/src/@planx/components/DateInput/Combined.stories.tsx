import { Meta } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const metadata: Meta = {
  title: "PlanX Components/DateInput",
};

export const Combined = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};

export default metadata;
