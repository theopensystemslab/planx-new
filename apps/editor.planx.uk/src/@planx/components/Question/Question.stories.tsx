import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import {
  basicArgs,
  withDescriptionsArgs,
  withImagesArgs,
} from "../shared/BaseQuestion/BaseQuestion.stories.config";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/Question",
  component: Public,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: basicArgs,
} satisfies Story;

export const WithDescriptions = {
  args: withDescriptionsArgs,
} satisfies Story;

export const WithImages = {
  args: withImagesArgs,
} satisfies Story;

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
