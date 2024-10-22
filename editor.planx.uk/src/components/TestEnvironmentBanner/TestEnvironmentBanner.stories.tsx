import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import TestEnvironmentBanner from "./TestEnvironmentBanner";

const meta = {
  title: "Design System/Molecules/TestEnvironmentBanner",
  component: TestEnvironmentBanner,
} satisfies Meta<typeof TestEnvironmentBanner>;

type Story = StoryObj<typeof meta>;

export default meta;

/** Will not display if the page URL includes .uk */
export const Basic = {
  render: () => <TestEnvironmentBanner />,
} satisfies Story;
