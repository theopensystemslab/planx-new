import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import { ExternalPortalList } from "./ExternalPortalList";

const { getState, setState } = useStore;

let initialState: FullStore;

beforeAll(() => (initialState = getState()));
afterEach(() => act(() => setState(initialState)));

const externalPortals: FullStore["externalPortals"] = {
  abc: { name: "Portal 1", href: "myTeam/portalOne" },
  def: { name: "Portal 2", href: "myTeam/portalTwo" },
};

it("does not display if there are no external portals in the flow", () => {
  const { container } = setup(<ExternalPortalList />);

  expect(container).toBeEmptyDOMElement();
});

it("displays a list of external portals if present in the flow", () => {
  act(() => setState({ externalPortals }));
  const { container, getAllByRole } = setup(<ExternalPortalList />);

  expect(container).not.toBeEmptyDOMElement();
  expect(getAllByRole("listitem")).toHaveLength(2);
});

it("allows users to navigate to the external portals", () => {
  act(() => setState({ externalPortals }));
  const { container, getAllByRole } = setup(<ExternalPortalList />);

  expect(container).not.toBeEmptyDOMElement();
  const [first, second] = getAllByRole("link") as HTMLAnchorElement[];
  expect(first).toHaveAttribute("href", "../myTeam/portalOne");
  expect(second).toHaveAttribute("href", "../myTeam/portalTwo");
});

it("should not have any accessibility violations on initial load", async () => {
  act(() => setState({ externalPortals }));
  const { container } = setup(<ExternalPortalList />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
