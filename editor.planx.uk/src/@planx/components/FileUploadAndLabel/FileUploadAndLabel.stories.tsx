import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import { Condition } from "./model";
import Public from "./Public";

const meta = {
  title: "PlanX Components/FileUploadAndLabel",
  component: Public,
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    title: "Upload and label",
    description:
      "Based on your answers so far, these are the documents and drawings needed for your application.",
    handleSubmit: () => {},
    hideDropZone: false,
    fileTypes: [
      {
        fn: "always",
        name: "Site plan",
        rule: {
          condition: Condition.AlwaysRequired,
        },
      },
      {
        fn: "conditional",
        name: "Roof plan",
        rule: {
          condition: Condition.AlwaysRequired,
        },
      },
      {
        fn: "documents.designAndAccess",
        name: "Design and Access statement",
        rule: {
          condition: Condition.AlwaysRecommended,
        },
        moreInformation: {
          info: "<p>It&apos;s a design and access statement innit.</p>",
        },
      },
      {
        fn: "proposal.drawing.section",
        name: "Section drawings",
        rule: {
          condition: Condition.AlwaysRecommended,
        },
      },
      {
        fn: "optional",
        name: "Heritage statement",
        rule: {
          condition: Condition.NotRequired,
        },
      },
      {
        fn: "optional2",
        name: "Utility bill",
        rule: {
          condition: Condition.NotRequired,
        },
      },
    ],
  },
} satisfies Story;

export const OptionalFilesOnly = {
  args: {
    title: "Upload and label",
    description:
      "Based on your answers so far, these are the documents and drawings needed for your application.",
    handleSubmit: () => {},
    hideDropZone: false,
    fileTypes: [
      {
        fn: "optional",
        name: "Heritage statement",
        rule: {
          condition: Condition.NotRequired,
        },
      },
      {
        fn: "optional2",
        name: "Utility bill",
        rule: {
          condition: Condition.NotRequired,
        },
      },
    ],
  },
} satisfies Story;

export const WithHiddenDropzone = {
  args: {
    title: "Upload and label",
    description:
      "Based on your answers so far, these are the documents and drawings needed for your application.",
    handleSubmit: () => {},
    hideDropZone: true,
    fileTypes: [
      {
        fn: "always",
        name: "Site plan",
        rule: {
          condition: Condition.AlwaysRequired,
        },
      },
      {
        fn: "conditional",
        name: "Roof plan",
        rule: {
          condition: Condition.AlwaysRequired,
        },
      },
      {
        fn: "documents.designAndAccess",
        name: "Design and Access statement",
        rule: {
          condition: Condition.AlwaysRecommended,
        },
        moreInformation: {
          info: "<p>It&apos;s a design and access statement innit.</p>",
        },
      },
      {
        fn: "proposal.drawing.section",
        name: "Section drawings",
        rule: {
          condition: Condition.AlwaysRecommended,
        },
      },
      {
        fn: "optional",
        name: "Heritage statement",
        rule: {
          condition: Condition.NotRequired,
        },
      },
      {
        fn: "optional2",
        name: "Utility bill",
        rule: {
          condition: Condition.NotRequired,
        },
      },
    ],
  },
};

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
