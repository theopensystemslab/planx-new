import Wrapper from "@planx/components/fixtures/Wrapper";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { http, HttpResponse } from "msw";

import Editor from "./Editor";
import { osTileError } from "./mocks/osTileError";
import { presentationalPropsMock } from "./mocks/propsMock";
import type { PresentationalProps } from "./Public";
import { Presentational } from "./Public";

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
  render: () => <Presentational {...defaultPresentationalProps} />,
};

export const WithPropertyTypeOverride: StoryObj = {
  render: () => (
    <Presentational
      {...defaultPresentationalProps}
      showPropertyTypeOverride={true}
    />
  ),
};

export const OSTileError: StoryObj = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/proxy/ordnance-survey/maps/vector/v1/", () =>
          HttpResponse.json(osTileError, { status: 500 }),
        ),
      ],
    },
  },
  render: () => (
    <Presentational
      {...defaultPresentationalProps}
      showPropertyTypeOverride={true}
    />
  ),
};

export const WithEditor = () => {
  return (
    <Wrapper
      Editor={Editor}
      Public={() => <Presentational {...defaultPresentationalProps} />}
    />
  );
};
