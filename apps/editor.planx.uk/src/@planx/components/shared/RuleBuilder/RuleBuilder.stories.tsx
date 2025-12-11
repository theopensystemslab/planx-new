import Box from "@mui/material/Box";
import { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";

import { Props, RuleBuilder } from ".";
import { Condition, Operator } from "./types";

/**
 * Wrapper component with state for interactive stories
 */
const RuleBuilderWithState = (args: Omit<Props, "onChange">) => {
  const [rule, setRule] = useState(args.rule);

  return (
    <RuleBuilder
      {...args}
      rule={rule}
      onChange={(newRule) => {
        setRule(newRule);
        console.log({ rule: newRule });
      }}
    />
  );
};

const meta = {
  title: "Editor Components/Modal/Rule Builder",
  component: RuleBuilderWithState,
  decorators: [
    (Story) => (
      <Box sx={{ height: "500px" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof RuleBuilderWithState>;

type Story = StoryObj<typeof meta>;

export default meta;

export const AllConditions = {
  name: "All conditions",
  render: (args) => <RuleBuilderWithState {...args} />,
  args: {
    rule: {
      fn: "someFn",
      val: "someVal",
      condition: Condition.RequiredIf,
      operator: Operator.Equals,
    },
  },
} satisfies Story;

export const Disabled = {
  render: (args) => <RuleBuilderWithState {...args} />,
  args: {
    disabled: true,
    rule: {
      fn: "someFn",
      val: "someVal",
      condition: Condition.RequiredIf,
      operator: Operator.Equals,
    },
  },
} satisfies Story;

export const SubsetOfConditions = {
  name: "Subset of conditions",
  render: (args) => <RuleBuilderWithState {...args} />,
  args: {
    conditions: [Condition.AlwaysRequired, Condition.RequiredIf],
    rule: {
      condition: Condition.AlwaysRequired,
    },
  },
} satisfies Story;

export const WithCustomLabels = {
  name: "With custom labels",
  render: (args) => <RuleBuilderWithState {...args} />,
  args: {
    labels: {
      [Condition.AlwaysRequired]: "Always display",
      [Condition.RequiredIf]: "Display if",
    },
    conditions: [Condition.AlwaysRequired, Condition.RequiredIf],
    rule: {
      fn: "someFn",
      val: "someVal",
      condition: Condition.RequiredIf,
      operator: Operator.Equals,
    },
  },
} satisfies Story;

export const WithDataSchema = {
  name: "With data schema",
  render: (args) => <RuleBuilderWithState {...args} />,
  args: {
    conditions: [Condition.AlwaysRequired, Condition.RequiredIf],
    rule: {
      fn: "someFn",
      val: "someVal",
      condition: Condition.RequiredIf,
      operator: Operator.Equals,
    },
    dataSchema: ["recommended", "required"],
  },
} satisfies Story;
