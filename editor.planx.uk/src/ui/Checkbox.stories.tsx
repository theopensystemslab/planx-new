import { Meta } from "@storybook/react";
import React from "react";

import type { Props } from "./Checkbox";
import Checkbox from "./Checkbox";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/Checkbox",
  component: Checkbox,
  argTypes: {
    color: { control: "color" },
  },
};

export const Basic = (args: Props) => <Checkbox {...args} />;
Basic.args = {
  checked: false,
};

export default metadata;
