import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta } from "@storybook/react";
import React from "react";

import Editor from "./Editor";
import digitalLandResponseMock from "./mocks/digitalLandResponseMock";
import Public, {
  PlanningConstraintsContent,
  PlanningConstraintsContentProps,
} from "./Public";

export default {
  title: "PlanX Components/PlanningConstraints",
  component: Public,
} satisfies Meta<typeof Public>;

const props: PlanningConstraintsContentProps = {
  title: "Planning constraints",
  description:
    "Planning constraints might limit how you can develop or use the property",
  fn: "property.constraints.planning",
  constraints: digitalLandResponseMock["constraints"],
  metadata: digitalLandResponseMock["metadata"],
  handleSubmit: () => console.log(""),
  refreshConstraints: () => console.log(""),
};

export const Basic = {
  render: () => <PlanningConstraintsContent {...props} />,
};

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;
