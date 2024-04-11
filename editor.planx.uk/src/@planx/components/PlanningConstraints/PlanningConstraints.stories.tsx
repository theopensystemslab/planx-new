import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta } from "@storybook/react";
import React from "react";

import Editor from "./Editor";
import classifiedRoadsNegativeResponseMock from "./mocks/classifiedRoadsNegativeResponseMock";
import classifiedRoadsResponseMock from "./mocks/classifiedRoadsResponseMock";
import digitalLandNegativeResponseMock from "./mocks/digitalLandNegativeResponseMock";
import digitalLandResponseMock from "./mocks/digitalLandResponseMock";
import Public, {
  PlanningConstraintsContent,
  PlanningConstraintsContentProps,
} from "./Public";

/**
 * PlanningConstraints fetches data about constraints from DLUHC's planning.data.gov.uk & data about classified roads from the Ordnance Survey Features API.
 *
 * We do a spatial query to find constraints that overlap with the red-line site boundary polygon drawn using DrawBoundary.
 * If an applicant uploads a PDF location plan or skips drawing, then we fallback to checking for constraints that intersect with the address point selected using FindProperty.
 *
 * Example sites:
 * - "With Intersections" is based on a site boundary around LAMBETH PALACE, LAMBETH PALACE ROAD, LONDON, SE1 7JU in July 2023
 * - "Without Intersections" is based on a site boundary around 2, WALLER ROAD, BEACONSFIELD, BUCKINGHAMSHIRE, HP9 2HE in July 2023
 */
export default {
  title: "PlanX Components/PlanningConstraints",
  component: Public,
} satisfies Meta<typeof Public>;

const propsWithIntersections: PlanningConstraintsContentProps = {
  title: "Planning constraints",
  description:
    "Planning constraints might limit how you can develop or use the property",
  fn: "property.constraints.planning",
  disclaimer:
    "This page does not include information about historic planning conditions that may apply to this property.",
  constraints: {
    ...digitalLandResponseMock["constraints"],
    ...classifiedRoadsResponseMock["constraints"],
  },
  metadata: {
    ...digitalLandResponseMock["metadata"],
    ...classifiedRoadsResponseMock["metadata"],
  },
  handleSubmit: () => {},
  refreshConstraints: () => {},
};

const propsWithoutIntersections: PlanningConstraintsContentProps = {
  title: "Planning constraints",
  description:
    "Planning constraints might limit how you can develop or use the property",
  fn: "property.constraints.planning",
  disclaimer:
    "This page does not include information about historic planning conditions that may apply to this property.",
  constraints: {
    ...digitalLandNegativeResponseMock["constraints"],
    ...classifiedRoadsNegativeResponseMock["constraints"],
  },
  metadata: {
    ...digitalLandNegativeResponseMock["metadata"],
    ...classifiedRoadsNegativeResponseMock["metadata"],
  },
  handleSubmit: () => {},
  refreshConstraints: () => {},
};

export const WithIntersections = {
  render: () => <PlanningConstraintsContent {...propsWithIntersections} />,
};

export const WithoutIntersections = {
  render: () => <PlanningConstraintsContent {...propsWithoutIntersections} />,
};

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;
