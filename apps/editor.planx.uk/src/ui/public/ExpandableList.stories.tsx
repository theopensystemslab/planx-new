import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { ExpandableList, ExpandableListItem } from "./ExpandableList";

const meta = {
  title: "Design System/Atoms/Form Elements/ExpandableList",
  component: ExpandableList,
} satisfies Meta<typeof ExpandableList>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    children: ["Option A", "Option B", "Option C"].map((option) => (
      <ExpandableListItem
        key={option}
        expanded={option === "Option B" ? true : false}
        headingId={`group-${option}-heading`}
        groupId={`group-${option}-content`}
        title={option}
      >
        <p>This is a description of the option.</p>
      </ExpandableListItem>
    )),
  },
} satisfies Story;
