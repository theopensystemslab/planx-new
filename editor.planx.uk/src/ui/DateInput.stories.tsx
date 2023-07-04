import { Meta } from "@storybook/react";
import React from "react";

import DateInput from "./DateInput";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/DateInput",
  component: DateInput,
  argTypes: {
    onChange: { action: true, control: { disable: true } },
  },
};

export const Basic = (args: { value: string }) => (
  <DateInput {...args} bordered onChange={() => {}} />
);
Basic.args = { value: "2020-20-02" };

export default metadata;
