import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { Meta, StoryObj } from "@storybook/react";
import { ComponentProps } from "react";
import { SectionNode } from "types";

import { Root as Public } from "./Public";

const meta = {
  title: "PlanX Components/Section",
  component: Public,
} satisfies Meta<typeof Public>;

type Story = StoryObj<typeof meta>;

export default meta;

const sectionNodes: { [key: string]: SectionNode } = {
  firstSection: {
    data: {
      title: "First section",
      description: "Description of first section",
    },
    type: TYPES.Section,
  },
  secondSection: {
    data: {
      title: "Second section",
      description: "Description of second section",
    },
    type: TYPES.Section,
  },
  thirdSection: {
    data: {
      title: "Third section",
      description: "Description of third section",
    },
    type: TYPES.Section,
  },
};

const defaultProps: ComponentProps<typeof Public> = {
  currentSectionIndex: 0,
  flowName: "Find out if you need planning permission",
  sectionNodes,
  currentCard: {
    id: "firstQuestion",
  },
  flow: {
    _root: {
      edges: ["firstSection", "secondSection", "thirdSection"],
    },
    ...sectionNodes,
  },
  changeAnswer: () => console.log("changeAnswer called"),
  breadcrumbs: {},
  title: "The property",
  description: "Short description of the property section",
  sectionCount: 3,
};

export const Basic = {
  args: defaultProps,
} satisfies Story;

export const FirstSectionCompleted = {
  args: {
    ...defaultProps,
    currentSectionIndex: 1,
    breadcrumbs: {
      firstSection: { auto: false },
    },
  },
} satisfies Story;

export const WithNewInformationNeeded = {
  args: {
    ...defaultProps,
    isReconciliation: true,
    breadcrumbs: {
      firstSection: { auto: false },
      secondSection: { auto: false },
    },
    alteredSectionIds: ["firstSection"],
  },
} satisfies Story;
