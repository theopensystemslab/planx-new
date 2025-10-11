import { MockedProvider } from "@apollo/client/testing";
import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Editor from "./Editor";
import { presentationalPropsMock } from "./mocks/propsMock";
import { Presentational, PresentationalProps } from "./Public";

/** PropertyInformation relies on a custom web component that cannot be rendered by React Storybook. Find additional docs here: https://oslmap.netlify.app/ */
export default {
  title: "PlanX Components/PropertyInformation",
  component: Presentational,
} as Meta<typeof Presentational>;

const defaultPresentationalProps: PresentationalProps = {
  ...presentationalPropsMock,
  overrideAnswer: () => console.log("test"),
};

export const Basic: StoryObj = {
  render: () => (
    <MockedProvider>
      <Presentational {...defaultPresentationalProps} />
    </MockedProvider>
  ),
};

export const WithPropertyTypeOverride: StoryObj = {
  render: () => (
    <MockedProvider>
      <Presentational
        {...defaultPresentationalProps}
        showPropertyTypeOverride={true}
      />
    </MockedProvider>
  ),
};

export const WithEditor = () => {
  return (
    <Wrapper
      Editor={Editor}
      Public={() => (
        <MockedProvider>
          <Presentational {...defaultPresentationalProps} />
        </MockedProvider>
      )}
    />
  );
};
