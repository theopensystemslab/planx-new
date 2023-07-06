import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import FindProperty from "./";

const metadata: Meta = {
  title: "PlanX Components/FindProperty",
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
  parameters: {
    reactNavi: {
      useCurrentRoute: () => {
        return {
          data: {
            team: "canterbury",
          },
        };
      },
    },
  },
};
export default metadata;

export const Basic: StoryObj<any> = {
  render: (args: any) => <FindProperty {...args} />,
};
