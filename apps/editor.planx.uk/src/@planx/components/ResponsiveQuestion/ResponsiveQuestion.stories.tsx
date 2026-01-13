import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import {
  basicResponsiveArgs,
  withDescriptionsResponsiveArgs,
  withImagesResponsiveArgs,
} from "../shared/BaseQuestion/BaseQuestion.stories.config";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/ResponsiveQuestion",
  component: Public,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: basicResponsiveArgs,
} satisfies Story;

export const WithDescriptions = {
  args: withDescriptionsResponsiveArgs,
} satisfies Story;

export const WithImages = {
  args: withImagesResponsiveArgs,
} satisfies Story;

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
