import { Story } from "@storybook/react/types-6-0";
import React from "react";

import Confirmation from "./Public";

export default {
  title: "PlanX Components/Confirmation",
  component: Confirmation,
};

interface Props {}

const Template: Story<Props> = (args: Props) => <Confirmation {...args} />;

export const Basic = Template.bind({});
Basic.args = {};
