import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../../fixtures/Wrapper";
import Editor from "../Editor";
import { Trees } from "../schemas/SketchPlanCA";
import { Presentational as Public, PresentationalProps } from ".";

const meta = {
  title: "PlanX Components/MapAndLabel",
  component: Public,
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

const props: PresentationalProps = {
  title: "Map and label the works to trees for this property",
  description: "Add one or many trees below",
  schemaName: "Trees",
  fn: "MockFn",
  schema: Trees,
  basemap: "OSM",
  drawColor: "#00FF00",
  drawType: "Point",
  longitude: -0.1629784,
  latitude: 51.5230919,
};

export const Basic: Story = {
  args: props,
};

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={() => <Public {...props} />} />;
};
