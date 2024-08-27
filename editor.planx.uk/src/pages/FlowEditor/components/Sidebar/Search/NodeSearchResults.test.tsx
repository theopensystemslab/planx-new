import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import { flow, results } from "./mocks/simple";
import { NodeSearchResults } from "./NodeSearchResults";

beforeAll(() => useStore.setState({ flow }));

it("Displays a warning if no results are returned", () => {
  const { getByText, getByRole } = setup(<NodeSearchResults results={[]} />);
  expect(getByText("No matches found")).toBeInTheDocument();
  expect(getByRole("list")).toBeEmptyDOMElement();
});

it("Displays the count for a single result", () => {
  const { getByText, getByRole, getAllByRole } = setup(
    <NodeSearchResults results={[results[0]]} />,
  );
  expect(getByText("1 result:")).toBeInTheDocument();
  expect(getByRole("list")).not.toBeEmptyDOMElement();
  expect(getAllByRole("listitem")).toHaveLength(1);
});

it("Displays the count for multiple results", () => {
  const { getByText, getByRole, getAllByRole } = setup(
    <NodeSearchResults results={results} />,
  );
  expect(getByText("2 results:")).toBeInTheDocument();
  expect(getByRole("list")).not.toBeEmptyDOMElement();
  expect(getAllByRole("listitem")).toHaveLength(2);
});

it("should not have any accessibility violations on initial load", async () => {
  const { container } = setup(<NodeSearchResults results={results} />);
  const axeResults = await axe(container);
  expect(axeResults).toHaveNoViolations();
});
