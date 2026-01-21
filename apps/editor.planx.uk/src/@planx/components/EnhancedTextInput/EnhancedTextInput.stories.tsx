import { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import { delay, http, HttpResponse } from "msw";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const ORIGINAL =
  "The Proposal is for a sympathetic mansard roof to replace the flat roof to the ground and fist floor side extension at the property under planning consent 2018/5913/P. See Planning Statement in Support Attached (PDF)";

const ENHANCED =
  "Erection of a mansard roof extension to the flat roof of the side extension.";

const meta = {
  title: "PlanX Components/Enhanced Text Input/Project Description",
  component: Public,
  argTypes: {
    handleSubmit: { action: true },
  },
  args: {
    title: "Describe the project",
    description: "Write a brief description of the proposed changes",
    task: "projectDescription",
    fn: "project.description",
    revisionTitle: "We suggest revising your project description",
    revisionDescription:
      "The suggested description uses planning terminology that planning officers expect, increasing your chances of approval.",
    howMeasured:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    policyRef:
      '<a href="https://www.legislation.gov.uk/ukpga/2023/36/section/3/made" target="_blank">https://www.legislation.gov.uk/ukpga/2023/36/section/3/made</a>',
    info: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  parameters: {
    msw: {
      handlers: [
        http.post("*/ai/project-description/enhance", async () => {
          await delay(3_000);
          return HttpResponse.json(
            {
              original: ORIGINAL,
              enhanced: ENHANCED,
            },
            { status: 200 },
          );
        }),
      ],
    },
  },
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: StoryObj = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("textbox");

    await userEvent.type(input, ORIGINAL, {
      delay: 50,
    });

    const submitButton = canvas.getByRole("button", { name: "Continue" });
    await userEvent.click(submitButton);
  },
};

export const Invalid = {
  parameters: {
    msw: {
      handlers: [
        http.post("*/ai/project-description/enhance", async () => {
          await delay(3_000);
          return HttpResponse.json(
            {
              error: "INVALID_INPUT",
              message:
                "The description doesn't appear to be related to a planning application.",
            },
            { status: 400 },
          );
        }),
      ],
    },
  },
} satisfies Story;

export const ServiceUnavailable = {
  parameters: {
    msw: {
      handlers: [
        http.post("*/ai/project-description/enhance", async () => {
          await delay(3_000);
          return HttpResponse.json(
            {
              error: "GATEWAY_ERROR",
              message:
                "There was an error with the request to upstream AI gateway",
            },
            { status: 400 },
          );
        }),
      ],
    },
  },
} satisfies Story;

export const RateLimitExceeded = {
  parameters: {
    msw: {
      handlers: [
        http.post("*/ai/project-description/enhance", async () => {
          await delay(3_000);
          return HttpResponse.json(
            {
              error: "TOO_MANY_REQUESTS",
            },
            { status: 400 },
          );
        }),
      ],
    },
  },
} satisfies Story;

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
