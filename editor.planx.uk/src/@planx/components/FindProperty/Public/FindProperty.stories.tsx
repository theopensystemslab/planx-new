import { MockedProvider } from "@apollo/client/testing";
import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Editor from "../Editor";
import FindProperty from "./";
import findAddressReturnMock from "./mocks/findAddressReturnMock";
import localAuthorityMock from "./mocks/localAuthorityMock";

export default {
  title: "PlanX Components/FindProperty",
  component: FindProperty,
  parameters: {
    swr: {
      default: () => {
        return {
          data: localAuthorityMock,
        };
      },
    },
  },
} as Meta;

export const EmptyForm: StoryObj = {
  render: () => (
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        title="Find your property"
        description="For example, SE5 0HU"
        allowNewAddresses={false}
      />
    </MockedProvider>
  ),
};

export const AllowNewAddressesOnMap: StoryObj = {
  render: () => (
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        title="Find your property"
        description="For example, SE5 0HU"
        allowNewAddresses={true}
      />
    </MockedProvider>
  ),
};

export const WithEditor = () => {
  return (
    <Wrapper
      Editor={Editor}
      Public={() => (
        <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
          <FindProperty
            title="Find your property"
            description="For example, SE5 0HU"
            allowNewAddresses={false}
          />
        </MockedProvider>
      )}
    />
  );
};
