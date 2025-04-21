import { Meta } from "@storybook/react";
import React from "react";

import {
  breadcrumbsWithSections,
  flowWithSections,
  passportWithSections,
} from "./Public/mocks/sections";
import {
  mockedBreadcrumbs,
  mockedFlow,
  mockedPassport,
} from "./Public/mocks/simple";
import Presentational from "./Public/Presentational";

const meta = {
  title: "PlanX Components/Review",
  component: Presentational,
  argTypes: {
    handleSubmit: { control: { disable: true }, action: true },
  },
} satisfies Meta<typeof Presentational>;

export default meta;

// TODO improve mock data to include one component of each type
export const Basic = () => {
  return (
    <Presentational
      title="Review"
      description="Check your answers before submitting"
      disclaimer="<p>Changing this answer means you will need to confirm any other answers after it. This is because: </p><ul><li>a different answer might mean the service asks new questions</li><li>your planning officer needs the right information to assess your application</li></ul></p>"
      breadcrumbs={mockedBreadcrumbs}
      flow={mockedFlow}
      passport={mockedPassport}
      handleSubmit={console.log}
      changeAnswer={(nodeId) => {
        window.alert(`nodeId=${nodeId}`);
      }}
      showChangeButton={true}
    />
  );
};

export const WithSections = () => {
  return (
    <Presentational
      title="Review"
      description="Check your answers before submitting"
      disclaimer="<p>Changing this answer means you will need to confirm any other answers after it. This is because: </p><ul><li>a different answer might mean the service asks new questions</li><li>your planning officer needs the right information to assess your application</li></ul></p>"
      breadcrumbs={breadcrumbsWithSections}
      flow={flowWithSections}
      passport={passportWithSections}
      handleSubmit={console.log}
      changeAnswer={(nodeId) => {
        window.alert(`nodeId=${nodeId}`);
      }}
      showChangeButton={true}
    />
  );
};
