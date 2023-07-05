import { Meta } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public/index";

export default {
  title: "PlanX Components/Calculate",
  component: Public,
} as Meta;

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
