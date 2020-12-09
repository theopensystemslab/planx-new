import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import DateInput from "./DateInput";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/DateInput",
  component: DateInput,
  argTypes: {
    onChange: { action: true, control: { disable: true } },
  },
};

// Test commit
export const Basic = (args: { value: string }) => (
  <DateInput {...args} onChange={() => {}} />
);
Basic.args = { value: "2020-20-02" };

export default metadata;
