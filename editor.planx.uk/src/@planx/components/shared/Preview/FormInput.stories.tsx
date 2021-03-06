import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";

import FormInput, { IFormInput } from "./FormInput";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/Input/FormInput",
  component: FormInput,
  argTypes: {
    value: { control: { disable: true } },
  },
};

const Template: Story<IFormInput> = (args) => <FormInput {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  placeholder: "Kantstraße 152, 10623 Berlin, Germany",
  helperText: "e.g. house, garden, flat",
};

export default metadata;
