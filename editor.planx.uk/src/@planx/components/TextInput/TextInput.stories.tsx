import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public, { Props } from "./Public";

export default {
  title: "PlanX Components/TextInput",
  component: Public,
  argTypes: {
    type: { control: { type: "radio", options: ["short", "long"] } },
  },
} as Meta;

const Template = (args: Props) => <Public {...args} />;

export const Frontend = Template.bind({});
Frontend.args = {
  title: "How was your day?",
  description: "Be as descriptive as you can.",
  placeholder: "I started with a long stroll...",
  type: "short",
} as Props;

export const FrontendEmail = Template.bind({});
FrontendEmail.args = {
  title: "What's your email?",
  type: "email",
  placeholder: "",
  description: "",
};

FrontendEmail.argTypes = {
  type: { control: { disable: true } },
};

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;
