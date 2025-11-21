import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta, StoryObj } from "@storybook/react";
import { graphql, http, HttpResponse } from "msw";
import React from "react";

import Editor from "../Editor";
import FindProperty from ".";
import fetchBLPUCodesMock from "./mocks/findAddressReturnMock";
import localAuthorityMock from "./mocks/localAuthorityMock";

/** FindProperty relies on a custom web component that cannot be shown by React Storybook. Find additional docs here: https://oslmap.netlify.app/ */
export default {
  title: "PlanX Components/FindProperty",
  component: FindProperty,
  parameters: {
    msw: {
      handlers: [
        http.get("https://www.planning.data.gov.uk/*", async () =>
          HttpResponse.json(localAuthorityMock, { status: 200 }),
        ),
        graphql.query("FetchBLPUCodes", () =>
          HttpResponse.json({ data: fetchBLPUCodesMock }),
        ),
      ],
    },
  },
} satisfies Meta<typeof FindProperty>;

export const EmptyForm: StoryObj = {
  render: () => (
    <FindProperty
      title="Find your property"
      description="For example, SE5 0HU"
      allowNewAddresses={false}
    />
  ),
};

export const AllowNewAddressesOnMap: StoryObj = {
  render: () => (
    <FindProperty
      title="Find your property"
      description="For example, SE5 0HU"
      allowNewAddresses={true}
    />
  ),
};

export const WithEditor = () => {
  return (
    <Wrapper
      Editor={Editor}
      Public={() => (
        <FindProperty
          title="Find your property"
          description="For example, SE5 0HU"
          allowNewAddresses={false}
        />
      )}
    />
  );
};
