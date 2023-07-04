import { Meta, StoryFn } from "@storybook/react";
import React from "react";

import PropertyInformation from "../../PropertyInformation/Public";
import FindProperty from "./";

const metadata: Meta = {
  title: "PlanX Components/FindProperty",
  // component: FindProperty,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
  parameters: {
    reactNavi: {
      useCurrentRoute: () => {
        return {
          data: {
            team: "canterbury",
          },
        };
      },
    },
  },
};
export default metadata;

export const Basic: StoryFn<any> = (args) => <FindProperty {...args} />;

export const PropInfo: StoryFn<any> = (args) => (
  <PropertyInformation
    {...{
      title: "About the property",
      lng: -0.07604657928865735,
      lat: 51.48590555860495,
      description:
        "This is the information we currently have about the property",
      propertyDetails: [
        { heading: "Address", detail: "47 COBOURG ROAD, LONDON" },
        { heading: "Postcode", detail: "SE5 0HU" },
        { heading: "District", detail: "Southwark" },
        { heading: "Building type", detail: "HMO Parent" },
      ],
      propertyConstraints: {
        title: "Constraints",
        constraints: [
          {
            text: "is in a Conservation Area",
            description:
              "http://www.southwark.gov.uk/planning-and-building-control/design-and-conservation/conservation-areas?chapter=10",
            value: true,
            type: "warning",
            data: {
              Conservation_area: "Cobourg Road",
              Conservation_area_number: 19,
              More_information:
                "http://www.southwark.gov.uk/planning-and-building-control/design-and-conservation/conservation-areas?chapter=10",
            },
          },
          {
            text: "is, or is within, a Grade II listed building",
            description:
              "https://geo.southwark.gov.uk/connect/analyst/Includes/Listed Buildings/SwarkLB 201.pdf",
            value: true,
            type: "warning",
            data: {
              ID: 470787,
              NAME: "",
              STREET_NUMBER: "47",
              STREET: "Cobourg Road",
              GRADE: "II",
              DATE_OF_LISTING: "1986-01-24",
              LISTING_DESCRIPTION:
                "https://geo.southwark.gov.uk/connect/analyst/Includes/Listed Buildings/SwarkLB 201.pdf",
            },
          },
          {
            value: false,
            text: "is not in a TPO (Tree Preservation Order) zone",
            type: "check",
            data: {},
          },
        ],
      },
    }}
  />
);
