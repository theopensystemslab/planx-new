import { Meta, StoryFn,StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import { TextInputType } from "./model";
import Public, { Props } from "./Public";

const metadata: Meta = {
  title: "PlanX Components/TextInput",
  component: Public,
  argTypes: {
    type: { control: { type: "radio", options: ["short", "long"] } },
  },
};

export const Frontend: StoryObj<Props> = {
  args: {
    title: "How was your day?",
    description: "Be as descriptive as you can.",
    type: TextInputType.Short,
  },
};

export const FrontendEmail: StoryObj<Props> = {
  args: {
    title: "What's your email?",
    type: TextInputType.Email,
    description: "",
  },

  argTypes: {
    type: { control: { disable: true } },
  },
};

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;

export default metadata;
