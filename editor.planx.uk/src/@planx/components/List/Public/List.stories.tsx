import { Meta, StoryObj } from "@storybook/react";

import { SCHEMAS } from "../Editor";
import ListComponent from "../Public";

const meta = {
  title: "PlanX Components/List",
  component: ListComponent,
} satisfies Meta<typeof ListComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: "List",
    description: "Add information on the removed residential units",
    schemaName: "Residential units (GLA) - Removed",
    fn: "MockFn",
    schema: SCHEMAS[4].schema,
  },
};

export const Singular: Story = {
  args: {
    title: "List",
    description: "List component with a min / max value set to 1",
    schemaName: "Proposed advertisements",
    fn: "MockFn",
    schema:
      SCHEMAS.find((schema) => schema.name === "Proposed advertisements")
        ?.schema || SCHEMAS[0].schema,
  },
};
