import type { IndexedNode } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";

import Customisations from ".";

const { setState } = useStore;

describe("Customisations tab", () => {
  it("renders no customisable nodes, and does not throw, when the flow is empty", async () => {
    setState({
      id: "test-flow-id",
      flow: { _root: { edges: [] } },
      isTemplatedFrom: false,
      isTemplate: true,
    });

    const { getByText, queryAllByRole } = await setup(<Customisations />);

    // Renders (no crash) but lists nothing
    expect(getByText("Nodes set to 'Allow edits'")).toBeInTheDocument();
    expect(queryAllByRole("listitem")).toHaveLength(0);
  });

  it("lists only templated nodes, in flow order", async () => {
    const node = (id: string, isTemplatedNode: boolean): IndexedNode => ({
      id,
      parentId: "_root",
      type: ComponentType.Question,
      data: {
        isTemplatedNode,
        templatedNodeInstructions: `instructions for ${id}`,
      },
    });

    const nodes = [
      node("alpha", true),
      node("skip1", false),
      node("bravo", true),
      node("skip2", false),
      node("charlie", true),
    ];

    const flow = Object.fromEntries(
      nodes.map(({ id, type, data }) => [id, { type, data }]),
    );

    setState({
      id: "test-flow-id",
      flow: { _root: { edges: nodes.map(({ id }) => id) }, ...flow },
      isTemplatedFrom: false,
      isTemplate: true,
    });

    const { getAllByRole, queryByText } = await setup(<Customisations />);

    const renderedInstructions = getAllByRole("listitem").map(
      (li) => li.textContent,
    );

    // Exactly the three templated nodes, in flow order
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
