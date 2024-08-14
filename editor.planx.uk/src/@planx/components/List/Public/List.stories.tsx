import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../../fixtures/Wrapper";
import { SCHEMAS } from "../Editor";
import Editor from "../Editor";
import ListComponent from "../Public";
import Public from "./";

const meta = {
  title: "PlanX Components/List",
  component: ListComponent,
} satisfies Meta<typeof ListComponent>;

type SchemaItem = (typeof SCHEMAS)[number];
type SchemaNames = SchemaItem["name"];

export default meta;

type Story = StoryObj<typeof meta>;

const schemaFinder = (name: SchemaNames) => {
  const schemaObj = SCHEMAS.find((schema) => schema.name === name)?.schema;
  return schemaObj || SCHEMAS[0].schema;
};

export const Basic: Story = {
  args: {
    title:
      "Describe any residential units that are being removed or lost as part of the development",
    description: "Add one or many units below",
    schemaName: "Residential units (GLA) - Removed",
    fn: "MockFn",
    schema: schemaFinder("Residential units (GLA) - Removed"),
  },
};

export const SingularItem: Story = {
  args: {
    title: "Describe the advertisements you want to add",
    description: "Complete the questions below",
    schemaName: "Proposed advertisements",
    fn: "MockFn",
    schema: schemaFinder("Proposed advertisements"),
  },
};

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
