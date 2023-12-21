import { Meta, StoryObj } from "@storybook/react";

import ExternalPlanningSiteDialog, {
  DialogPurpose,
} from "./ExternalPlanningSiteDialog";

const meta = {
  title: "Design System/Atoms/Form Elements/ExternalPlanningSiteDialog",
  component: ExternalPlanningSiteDialog,
} satisfies Meta<typeof ExternalPlanningSiteDialog>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    purpose: DialogPurpose.MissingProjectType,
    teamSettings: {
      externalPlanningSite: {
        name: "Council website",
        url: "test.gov.uk",
      },
    },
  },
} satisfies Story;
