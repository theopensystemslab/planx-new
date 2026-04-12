import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor, { PAGE_SCHEMAS } from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/Page",
  component: Public,
} satisfies Meta<typeof Public>;

type SchemaItem = (typeof PAGE_SCHEMAS)[number];
type SchemaNames = SchemaItem["name"];

export default meta;

type Story = StoryObj<typeof meta>;

const schemaFinder = (name: SchemaNames) => {
  const schemaObj = PAGE_SCHEMAS.find((schema) => schema.name === name)?.schema;
  return schemaObj || PAGE_SCHEMAS[0].schema;
};

export const Basic: Story = {
  args: {
    title: "Tell us about your proposed advertisements",
    description: "Please add your details below",
    schemaName: "Advert consent",
    fn: "MockFn",
    schema: schemaFinder("Advert consent"),
  },
};

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
