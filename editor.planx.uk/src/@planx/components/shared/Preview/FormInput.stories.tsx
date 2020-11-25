import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";

import FormInput, { IFormInput } from "./FormInput";

export default {
  title: "Forms/Text",
  component: FormInput,
  argTypes: {
    value: { control: { disable: true } },
  },
} as Meta;

const Template: Story<IFormInput> = (args) => <FormInput {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  placeholder: "Kantstraße 152, 10623 Berlin, Germany",
  helperText: "e.g. house, garden, flat",
};
