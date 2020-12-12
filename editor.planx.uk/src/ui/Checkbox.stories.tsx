import { Meta } from "@storybook/react/types-6-0";
import React, { useState } from "react";

import Checkbox from "./Checkbox";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/Checkbox",
  component: Checkbox,
  argTypes: {
    color: { control: "color" },
  },
};

export const Basic = (args) => <Checkbox {...args} />;
Basic.args = {
  checked: false,
};

export default metadata;
