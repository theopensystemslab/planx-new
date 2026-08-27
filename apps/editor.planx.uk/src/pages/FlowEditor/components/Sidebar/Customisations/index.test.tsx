import type { OrderedFlow } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";

import Customisations from ".";

const { setState } = useStore;

describe("Customisations tab", () => {
  it("renders no customisable nodes, and does not throw, when orderedFlow is unavailable", async () => {
    setState({
      id: "test-flow-id",
      orderedFlow: undefined,
      isTemplatedFrom: false,
      isTemplate: true,
    });

    const { getByText, queryAllByRole } = await setup(<Customisations />);

    // Renders (no crash) but lists nothing
    expect(getByText("Nodes set to 'Allow edits'")).toBeInTheDocument();
    expect(queryAllByRole("listitem")).toHaveLength(0);
  });

  it("lists only templated nodes, in orderedFlow order", async () => {
    const node = (
      id: string,
      isTemplatedNode: boolean,
    ): OrderedFlow[number] => ({
      id,
      parentId: "_root",
      type: ComponentType.Question,
      data: {
        isTemplatedNode,
        templatedNodeInstructions: `instructions for ${id}`,
      },
    });

    const orderedFlow: OrderedFlow = [
      node("alpha", true),
      node("skip1", false),
      node("bravo", true),
      node("skip2", false),
      node("charlie", true),
    ];

    const flow = Object.fromEntries(
      orderedFlow.map(({ id, type, data }) => [id, { type, data }]),
    );

    setState({
      id: "test-flow-id",
      orderedFlow,
      flow: { _root: { edges: [] }, ...flow },
      isTemplatedFrom: false,
      isTemplate: true,
    });

    const { getAllByRole, queryByText } = await setup(<Customisations />);

    const renderedInstructions = getAllByRole("listitem").map(
      (li) => li.textContent,
    );

    // Exactly the three templated nodes, in orderedFlow order
    expect(renderedInstructions).toEqual([
      expect.stringContaining("instructions for alpha"),
      expect.stringContaining("instructions for bravo"),
      expect.stringContaining("instructions for charlie"),
    ]);

    // Non-templated nodes are excluded
    expect(queryByText("instructions for skip1")).not.toBeInTheDocument();
    expect(queryByText("instructions for skip2")).not.toBeInTheDocument();
  });
});
