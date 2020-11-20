import { Meta,Story } from "@storybook/react/types-6-0";
import React from "react";

import FormInput, { IFormInput } from "./FormInput";

export default {
  title: "Forms/Input",
} as Meta;

const Template: Story<IFormInput> = (args) => <FormInput {...args} />;

const basicSetup = {
  placeholder: "Kantstraße 152, 10623 Berlin, Germany",
  helperText: "",
};

export const Primary = Template.bind({});
Primary.args = basicSetup;

export const WithHelperText = Template.bind({});
WithHelperText.args = { ...basicSetup, helperText: "e.g. house, garden, flat" };
