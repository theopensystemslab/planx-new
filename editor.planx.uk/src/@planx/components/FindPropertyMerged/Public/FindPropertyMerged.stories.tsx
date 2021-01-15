import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";

import FindPropertyMerged from "./index";

const metadata: Meta = {
  title: "PlanX Components/FindPropertyMerged",
  component: FindPropertyMerged,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
};

export const Basic: Story<any> = (args) => <FindPropertyMerged {...args} />;

export default metadata;
