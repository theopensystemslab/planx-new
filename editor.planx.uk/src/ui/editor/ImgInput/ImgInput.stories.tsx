import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import ImgInput from "./ImgInput";

const meta = {
  title: "Design System/Atoms/Form Elements/ImageInput",
  component: ImgInput,
} satisfies Meta<typeof ImgInput>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  render: () => <ImgInput />,
} satisfies Story;
