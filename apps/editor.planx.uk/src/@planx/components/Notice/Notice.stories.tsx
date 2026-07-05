import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/Notice",
  component: Public,
  argTypes: {
    handleSubmit: { action: true },
  },
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    title: "This service is still in development",
    description:
      "This new kind of service is still in development, so you may encounter bumps and issues. Please use the feedback button to record comments or report issues as you go along.",
    color: "#F9F8F8",
    resetButton: false,
  },
} satisfies Story;

export const WithReset = {
  args: {
    title: "It looks like this property is not in Lambeth",
    description:
      "Check your local planning authority before starting this service.",
    color: "#FFE9E9",
    resetButton: true,
  },
} satisfies Story;

export const WithEditor = () => {
  return (
    <Wrapper
      Editor={Editor}
      Public={Public}
      componentType={ComponentType.Notice}
    />
  );
};
