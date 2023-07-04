import { Meta, StoryFn } from "@storybook/react";
import React from "react";

import Input, { Props } from "./Input";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/Input",
  component: Input,
};

const Template: StoryFn<Props> = (args) => <Input {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  bordered: false,
};

export const WithError = Template.bind({});
WithError.args = {
  bordered: true,
  errorMessage: "WRONG YOU'RE SIMPLY WRONG",
};

export const Multiline = Template.bind({});
Multiline.args = {
  bordered: true,
  multiline: true,
};

export default metadata;
