import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import type { Props as PublicProps } from "./Public";
import Public from "./Public";

const metadata: Meta = {
  title: "PlanX Components/NextSteps",
  component: Public,
  argTypes: {
    handleSubmit: { control: { disable: true }, action: false },
  },
};

export const Frontend: StoryObj<PublicProps> = {
  args: {
    title: "What would you like to do next?",
    description: "The decision is yours.",
    steps: [
      {
        title: "First option",
        description: "Get advice before submitting continuing your project.",
        url: "https://www.planx.uk",
      },
      {
        title: "Second option",
        description: "Find out how to submit an application.",
        url: "https://www.planx.uk",
      },
      {
        title: "Third option",
        description: "Your progress will be automatically saved.",
        url: "https://www.planx.uk",
      },
    ],
  },
};

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;

export default metadata;
