import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";

import PhaseBanner from "./PhaseBanner";

const metadata: Meta = {
  title: "Design System/Molecules/PhaseBanner",
  component: PhaseBanner,
};

export const Basic: Story = () => {
  return <PhaseBanner />;
};

export default metadata;
