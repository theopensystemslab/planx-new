import { Story } from "@storybook/react";
import React from "react";

import PhaseBanner from "./PhaseBanner";

export const Basic: Story = () => {
  return <PhaseBanner />;
};

export default {
  title: "Design System/Molecules/PhaseBanner",
  component: PhaseBanner,
};
