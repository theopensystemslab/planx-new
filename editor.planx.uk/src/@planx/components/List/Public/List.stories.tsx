import { Meta, StoryObj } from "@storybook/react";

import ListComponent from "../Public";

const meta = {
  title: "PlanX Components/List",
  component: ListComponent,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} satisfies Meta<typeof ListComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    fn: "",
    title: "string",
    description: "string",
    schemaName: "string",
    schema: {
      type: "",
      fields: [
        { type: "text", data: { title: "", fn: "" } },
        { type: "text", data: { title: "", fn: "" } },
        { type: "text", data: { title: "", fn: "" } },
        { type: "text", data: { title: "", fn: "" } },
      ],
      min: 1,
      max: 3,
    },
  },
};
