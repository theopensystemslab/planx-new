import { ComponentType } from "@opensystemslab/planx-core/types";
import { Meta, StoryObj } from "@storybook/react";
import React from "react"

import Wrapper from "../fixtures/Wrapper";
import { EditorProps } from "../shared/types";
import Editor from "./Editor/Editor";
import { ChecklistWithOptions } from "./model";
import Checklist from "./Public/Public";
import { mockWithRepeatedOptions } from "./Public/tests/mockOptions";

const meta = {
  title: "PlanX Components/Checklist",
  component: Checklist,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} satisfies Meta<typeof Checklist>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    text: "List the changes involved in the project",
    description: "Select only as many as you need to describe the project.",
    howMeasured:
      "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
    options: [
      { id: "a", data: { val: "a", text: "Repair windows or doors" } },
      { id: "b", data: { val: "b", text: "Changes to trees or hedges" } },
      { id: "c", data: { val: "c", text: "Install a swimming pool" } },
    ],
    allRequired: false,
  },
} satisfies Story;

export const Grouped = {
  args: {
    text: "List the changes involved in the project",
    description: "Select only as many as you need to describe the project.",
    howMeasured:
      "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
    groupedOptions: [
      {
        title: "Windows, doors and shopfronts",
        children: [
          { id: "a", data: { val: "a", text: "Repair windows or doors" } },
          { id: "b", data: { val: "b", text: "Add or alter shutters" } },
        ],
      },
      {
        title: "Garden and outdoors",
        children: [
          { id: "c", data: { val: "c", text: "Changes to trees or hedges" } },
          { id: "d", data: { val: "d", text: "Install a swimming pool" } },
          {
            id: "e",
            data: {
              val: "e",
              text: "Changes to a public road, pavement or path (including drop kerb)",
            },
          },
        ],
      },
    ],
  },
} satisfies Story;

export const WithDescriptions = {
  args: {
    text: "List the changes involved in the project",
    description: "Select only as many as you need to describe the project.",
    howMeasured:
      "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
    options: [
      { id: "a", data: { val: "a", text: "Repair windows or doors" } },
      {
        id: "b",
        data: {
          val: "b",
          text: "Changes to trees or hedges",
          description:
            "This includes trimming, fully removing, and planting new trees or hedges.",
        },
      },
      {
        id: "c",
        data: {
          val: "c",
          text: "Install a swimming pool",
          description:
            "This option alone does not include any outbuildings, fences, or landscaping.",
        },
      },
    ],
    allRequired: false,
  },
} satisfies Story;

export const WithImages = {
  args: {
    text: "What do you want to do to the roof?",
    description: "Select all that apply",
    options: [
      {
        id: "a",
        data: {
          val: "a",
          text: "Add dormers",
          img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/0pyd8i7c/4.4_roof-extensions_SemiD_Roof_extensiontype_reardormer.svg",
        },
      },
      {
        id: "b",
        data: {
          val: "b",
          text: "Convert a hip roof to a gable",
          img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/2mlyvlia/4.4_roof-extensions_SemiD_Roof_extensiontype_hiptogable.svg",
        },
      },
      {
        id: "c",
        data: {
          val: "c",
          text: "Add a storey",
          img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/5oqr1hne/4.4_roof-extensions_SemiD_Roof_extensiontype_addstorey.svg",
        },
      },
    ],
  },
};

export const ExclusiveOr = {
  args: {
    text: "List the changes involved in the project",
    description: "Select only as many as you need to describe the project.",
    howMeasured:
      "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
    options: [
      { id: "a", data: { val: "a", text: "Repair windows or doors" } },
      { id: "b", data: { val: "b", text: "Changes to trees or hedges" } },
      { id: "c", data: { val: "c", text: "Install a swimming pool" } },
      {
        id: "none",
        data: { val: "none", text: "None of the above", exclusive: true },
      },
    ],
    allRequired: false,
  },
} satisfies Story;

export const AllRequired = {
  args: {
    text: "I confirm that:",
    description: "",
    options: [
      {
        id: "agree",
        data: {
          text: "The information contained in this application is truthful, accurate and complete, to the best of my knowledge",
        },
      },
    ],
    allRequired: true,
  },
} satisfies Story;

export const WithRepeatedOptions = {
  args: mockWithRepeatedOptions,
} satisfies Story;

const EditorWithFlatOptions = (props: EditorProps<ComponentType, ChecklistWithOptions, Record<string, unknown>>) => {
  const editorProps: ChecklistWithOptions = {
    ...props,
    groupedOptions: undefined,
    options: [],
  };

  return <Editor {...editorProps} />;
};

export const WithEditor = () => {
  return (
    <Wrapper
      Editor={EditorWithFlatOptions}
      Public={Checklist}
    />
  );
};
