import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import DateInput from "./DateInput";

export default {
  title: "Components/DateInput",
  component: DateInput,
  argTypes: {
    onChange: { action: true, control: { disable: true } },
  },
} as Meta;

export const Basic = (args) => <DateInput {...args} />;
Basic.args = { value: "2020-20-02" };
