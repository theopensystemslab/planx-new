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
