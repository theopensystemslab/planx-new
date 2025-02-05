import { Schema } from "@planx/components/shared/Schema/model";

import { PresentationalProps } from "../../Public";
import { SketchPlanCA } from "../../schemas/SketchPlanCA";
import {
  previouslySubmittedDoubleFeature,
  previouslySubmittedSingleFeature,
} from "./mockPayload";

const mockTreeSchema: Schema = {
  ...SketchPlanCA,
  fields: SketchPlanCA.fields.filter((field) => field.type !== "date"),
};

export const props: PresentationalProps = {
  title: "Mock title",
  description: "Mock description",
  schemaName: "Sketch plan - Conservation areas",
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
