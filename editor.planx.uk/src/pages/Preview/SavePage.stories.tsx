import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import SavePage, { SaveError,SaveSuccess } from "./SavePage";

const meta = {
  title: "Design System/Pages/Save",
  component: SavePage,
} satisfies Meta<typeof SavePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  render: () => (
    <SaveSuccess saveToEmail="applicant@yahoo.com" expiryDate="2025-01-01" />
  ),
} satisfies Story;

export const OnSaveSuccess = {
  render: () => (
    <SaveSuccess saveToEmail="applicant@yahoo.com" expiryDate="2025-01-01" />
  ),
} satisfies Story;

export const OnSaveError = {
  render: () => <SaveError />,
} satisfies Story;
