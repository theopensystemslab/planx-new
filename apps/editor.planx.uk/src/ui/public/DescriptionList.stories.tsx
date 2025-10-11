import { Meta, StoryObj } from "@storybook/react";

import { DescriptionList } from "./DescriptionList";

const meta = {
  title: "Design System/Atoms/Form Elements/DescriptionList",
  component: DescriptionList,
} satisfies Meta<typeof DescriptionList>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    data: [
      {
        term: "Application type",
        details: "Apply for planning permission",
      },
      {
        term: "Reference number",
        details: "1ab2-3c4d-5e6f",
      },
      {
        term: "Valid until",
        details: "2025-01-01",
      },
    ],
  },
} satisfies Story;
