import { Schema } from "@planx/components/shared/Schema/model";

import { PresentationalProps } from "../../Public";
import { Trees } from "../../schemas/Trees";
import {
  previouslySubmittedDoubleFeature,
  previouslySubmittedSingleFeature,
} from "./mockPayload";

const mockTreeSchema: Schema = {
  ...Trees,
  fields: Trees.fields.filter((field) => field.type !== "date"),
};

export const props: PresentationalProps = {
  title: "Mock title",
  description: "Mock description",
  schemaName: "Trees",
  fn: "MockFn",
  schema: mockTreeSchema,
  basemap: "OSM",
  drawColor: "#00FF00",
  drawType: "Point",
  longitude: -0.1629784,
  latitude: 51.5230919,
};

export const previouslySubmittedSingleFeatureProps: PresentationalProps = {
  ...props,
  previouslySubmittedData: previouslySubmittedSingleFeature,
};

export const previouslySubmittedDoubleFeatureProps: PresentationalProps = {
  ...props,
  previouslySubmittedData: previouslySubmittedDoubleFeature,
};
