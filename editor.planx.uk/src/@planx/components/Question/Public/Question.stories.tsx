import { Meta, StoryObj } from "@storybook/react";

import Question from "./Question";

const meta = {
  title: "PlanX Components/Question",
  component: Question,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} satisfies Meta<typeof Question>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    text: "What type of property is it?",
    description: "",
    howMeasured:
      "**Flat** includes maisonettes (a flat with more than one storey that is within a shared building)",
    handleSubmit: () => {},
    responses: [
      { id: "House", responseKey: "House", title: "House" },
      {
        id: "Flat",
        responseKey: "Flat",
        title: "Flat (or building containing flats)",
      },
      {
        id: "HMO",
        responseKey: "HMO",
        title: "A house in multiple occupation (HMO)",
      },
      { id: "Other", responseKey: "Other", title: "Something else" },
    ],
  },
} satisfies Story;

export const WithDescriptions = {
  args: {
    text: "What type of house is it?",
    description: "",
    handleSubmit: () => {},
    responses: [
      {
        id: "Detached",
        responseKey: "Detached",
        title: "Detached",
        description: "A detached house is not joined to another property.",
      },
      {
        id: "Semi-detached",
        responseKey: "Semi-detached",
        title: "Semi-detached",
        description:
          "A semi-detached house is joined to 1 other property which, in turn, is not attached to any other properties. So together, the 2 properties form a pair.",
      },
      {
        id: "Terrace",
        responseKey: "Terrace",
        title: "Terrace",
        description:
          "A terrace is a building that forms part of a row of 3 or more adjoining properties.",
      },
      {
        id: "End terrace",
        responseKey: "End terrace",
        title: "End terrace",
        description:
          "An end terrace is the building at the end of the row of a terrace.",
      },
    ],
  },
} satisfies Story;

export const WithImages = {
  args: {
    text: "What type of house is it?",
    description: "",
    handleSubmit: () => {},
    responses: [
      {
        id: "Detached",
        responseKey: "Detached",
        title: "Detached",
        img: "https://api.editor.planx.uk/file/public/pk8f4g4h/housetypes_detached.png",
      },
      {
        id: "Semi-detached",
        responseKey: "Semi-detached",
        title: "Semi-detached",
        img: "https://api.editor.planx.uk/file/public/2jpkk6ei/housetypes_semiDetached.png",
      },
      {
        id: "Terrace",
        responseKey: "Terrace",
        title: "Terrace",
        img: "https://api.editor.planx.uk/file/public/btyxwr2j/housetypes_midterrace.png",
      },
      {
        id: "End terrace",
        responseKey: "End terrace",
        title: "End terrace",
        img: "https://api.editor.planx.uk/file/public/u0lwhiv2/housetypes_endterrace.png",
      },
    ],
  },
} satisfies Story;

// Question's Editor is a bit of an atypical implementation requiring props, which throws a type error here and fails to render - need to revisit!
// export const WithEditor = () => <Wrapper Editor={<Editor node={{ data: { text: "What do you want to ask?" } }} handleSubmit={() => {}}/>} Public={Question} />;
