import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import FindProperty from "./index";

export default {
  title: "PlanX Components/FindProperty",
  component: FindProperty,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} as Meta;

export const Basic = (args) => <FindProperty {...args} />;
