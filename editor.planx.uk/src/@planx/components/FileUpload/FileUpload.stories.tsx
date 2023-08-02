import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/FileUpload",
  component: Public,
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    title: "Upload roof plan",
    description:
      "The plan should show the roof of the building as it looks today.",
    handleSubmit: () => {},
    howMeasured: `<p>Your roof plan must:</p><ul><li>be drawn to scale. This is usually 1:100 or 1:50 at A3 or A4 size</li><li>have a scale bar</li><li>have a unique drawing reference number</li></ul>`,
  },
} satisfies Story;

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
