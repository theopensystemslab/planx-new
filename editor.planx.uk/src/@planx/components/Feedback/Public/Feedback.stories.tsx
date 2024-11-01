import { Meta, StoryObj } from "@storybook/react";

import {
  descriptionPlaceholder,
  disclaimerPlaceholder,
  freeformQuestionPlaceholder,
  ratingQuestionPlaceholder,
  titlePlaceholder,
} from "../components/placeholders";
import Public from "./Public";

const meta = {
  title: "PlanX Components/Feedback",
  component: Public,
} satisfies Meta<typeof Public>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    title: titlePlaceholder,
    feedbackRequired: false,
    description: descriptionPlaceholder,
    freeformQuestion: freeformQuestionPlaceholder,
    ratingQuestion: ratingQuestionPlaceholder,
    disclaimer: disclaimerPlaceholder,
  },
} satisfies Story;
