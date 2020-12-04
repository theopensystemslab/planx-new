import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import FindProperty from "./index";

const metadata: Meta = {
  title: "PlanX Components/FindProperty",
  component: FindProperty,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
};

export const Basic = (args) => <FindProperty {...args} />;

export default metadata;
