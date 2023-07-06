import { MockedProvider } from "@apollo/client/testing";
import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Editor from "./Editor";
import { Presentational, PresentationalProps } from "./Public";

export default {
  title: "PlanX Components/PropertyInformation",
  component: Presentational,
} as Meta;

// Would be nice to import/share these default props between tests & stories, but Storybook will throw error "jest is not defined" on overrideAnswer
const defaultPresentationalProps: PresentationalProps = {
  title: "About the property",
  description: "This is the information we currently have about the property",
  address: {
    uprn: "200003497830",
    town: "LONDON",
    y: 177898.62376470293,
    x: 533662.1449918789,
    street: "COBOURG ROAD",
    sao: "",
    postcode: "SE5 0HU",
    pao: "103",
    organisation: "",
    blpu_code: "PP",
    latitude: 51.4842536,
    longitude: -0.0764165,
    single_line_address: "103 COBOURG ROAD, LONDON, SE5 0HU",
    title: "103 COBOURG ROAD, LONDON",
    planx_description: "HMO Parent",
    planx_value: "residential.HMO.parent",
    source: "os",
  },
  propertyType: ["residential.HMO.parent"],
  localAuthorityDistrict: ["Southwark"],
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
