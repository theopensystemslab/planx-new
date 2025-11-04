import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/Question",
  component: Public,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    text: "What type of property is it?",
    description: "",
    howMeasured:
      "**Flat** includes maisonettes (a flat with more than one storey that is within a shared building)",
    handleSubmit: () => {},
    options: [
      { id: "House", data: { text: "House" } },
      {
        id: "Flat",
        data: { text: "Flat (or building containing flats)" },
      },
      {
        id: "HMO",
        data: {
          text: "A house in multiple occupation (HMO)",
        },
      },
      { id: "Other", data: { text: "Something else" } },
    ],
  },
} satisfies Story;

export const WithDescriptions = {
  args: {
    text: "What type of house is it?",
    description: "",
    handleSubmit: () => {},
    options: [
      {
        id: "Detached",
        data: {
          text: "Detached",
          description: "A detached house is not joined to another property.",
        },
      },
      {
        id: "Semi-detached",
        data: {
          text: "Semi-detached",
          description:
            "A semi-detached house is joined to 1 other property which, in turn, is not attached to any other properties. So together, the 2 properties form a pair.",
        },
      },
      {
        id: "Terrace",
        data: {
          text: "Terrace",
          description:
            "A terrace is a building that forms part of a row of 3 or more adjoining properties.",
        },
      },
      {
        id: "End terrace",
        data: {
          text: "End terrace",
          description:
            "An end terrace is the building at the end of the row of a terrace.",
        },
      },
    ],
  },
} satisfies Story;

export const WithImages = {
  args: {
    text: "What type of house is it?",
    description: "",
    handleSubmit: () => {},
    options: [
      {
        id: "Detached",
        data: {
          text: "Detached",
          img: "https://api.editor.planx.uk/file/public/pk8f4g4h/housetypes_detached.png",
        },
      },
      {
        id: "Semi-detached",
        data: {
          text: "Semi-detached",
          img: "https://api.editor.planx.uk/file/public/2jpkk6ei/housetypes_semiDetached.png",
        },
      },
      {
        id: "Terrace",
        data: {
          text: "Terrace",
          img: "https://api.editor.planx.uk/file/public/btyxwr2j/housetypes_midterrace.png",
        },
      },
      {
        id: "End terrace",
        data: {
          text: "End terrace",
          img: "https://api.editor.planx.uk/file/public/u0lwhiv2/housetypes_endterrace.png",
        },
      },
    ],
  },
} satisfies Story;

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
