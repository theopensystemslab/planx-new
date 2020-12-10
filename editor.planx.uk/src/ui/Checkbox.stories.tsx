import { Meta } from "@storybook/react/types-6-0";
import React, { useState } from "react";

import Checkbox from "./Checkbox";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/Checkbox",
  component: Checkbox,
};

export const Basic = (args) => <Checkbox {...args} />;
Basic.args = {
  label: "Option",
  checked: false,
};

export default metadata;
