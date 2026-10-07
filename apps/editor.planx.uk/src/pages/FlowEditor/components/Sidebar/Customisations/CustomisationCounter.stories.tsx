import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";

import { CustomisationCounter } from "./CustomisationCounter";
import type { FlowEdits } from "./types";

const REQUIRED_NODE_IDS = ["node1", "node2", "node3", "node4"];

const mockFlow: Store.Flow = {
  _root: { edges: REQUIRED_NODE_IDS },
  ...Object.fromEntries(
    REQUIRED_NODE_IDS.map((id) => [
      id,
      {
        type: ComponentType.Notice,
        data: {
          title: `Notice ${id}`,
          isTemplatedNode: true,
          areTemplatedNodeInstructionsRequired: true,
        },
      },
    ]),
  ),
};

const buildFlowEdits = (count: number): FlowEdits =>
  Object.fromEntries(
    REQUIRED_NODE_IDS.slice(0, count).map((id) => [
      id,
      { title: `Customised ${id}` },
    ]),
  );

const meta = {
  title: "Editor Components/Templates/CustomisationCounter",
  component: CustomisationCounter,
  args: {
    customisableNodeIds: REQUIRED_NODE_IDS,
    flowEdits: {},
  },
  decorators: [
    (Story) => {
      useStore.setState({ flow: mockFlow, orderedFlow: undefined });
      return <Story />;
    },
  ],
} satisfies Meta<typeof CustomisationCounter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoneComplete: Story = {
  name: "0/4 customisations complete",
  args: { flowEdits: buildFlowEdits(0) },
};

export const SomeComplete: Story = {
  name: "2/4 customisations complete",
  args: { flowEdits: buildFlowEdits(2) },
};

export const AllComplete: Story = {
  name: "All customisations complete",
  args: { flowEdits: buildFlowEdits(4) },
};
