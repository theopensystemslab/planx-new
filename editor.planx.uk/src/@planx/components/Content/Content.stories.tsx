import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

export default {
  title: "PlanX Components/Content",
  component: Public,
  argTypes: {
    handleSubmit: { action: true },
  },
};

export const Frontend = (args) => <Public {...args} />;
Frontend.args = {
  content: "Lots of information here",
};

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;
