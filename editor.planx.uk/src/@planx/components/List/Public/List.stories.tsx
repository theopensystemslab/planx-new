import { Meta, StoryObj } from "@storybook/react";

import { SCHEMAS } from "../Editor";
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

console.log(SCHEMAS);

export const Basic: Story = {
  args: {
    fn: "",
    title: "This is a new Title for a List",
    description: "This new list has a description which is what is here",
    schemaName: "TestSchemaName",
    schema: SCHEMAS[1].schema,
  },
};
