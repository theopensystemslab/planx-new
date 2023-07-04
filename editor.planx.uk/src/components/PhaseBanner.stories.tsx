import { StoryFn } from "@storybook/react";
import React from "react";

import PhaseBanner from "./PhaseBanner";

export const Basic: StoryFn = () => {
  return <PhaseBanner />;
};

export default {
  title: "Design System/Molecules/PhaseBanner",
  component: PhaseBanner,
};
