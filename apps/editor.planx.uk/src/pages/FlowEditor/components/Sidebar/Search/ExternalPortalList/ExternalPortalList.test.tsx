import { act, waitFor } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Search from "..";
import { flow } from "../mocks/simple";
import { VirtuosoWrapper } from "../testUtils";

vi.mock("react-navi", () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
  }),
}));

const { setState } = useStore;

beforeAll(() => act(() => setState({ flow })));

const externalPortals: FullStore["externalPortals"] = {
  abc: { name: "Portal 1", href: "myTeam/portalOne" },
  def: { name: "Portal 2", href: "myTeam/portalTwo" },
};

it("does not display if there are no external portals in the flow", () => {
  const { queryByTestId } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  expect(queryByTestId("searchExternalPortalList")).not.toBeInTheDocument();
});

it("does not display if there is no search term provided", () => {
  act(() => setState({ externalPortals }));

  const { queryByTestId } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  expect(queryByTestId("searchExternalPortalList")).not.toBeInTheDocument();
});

it("displays a list of external portals if present in the flow, and a search term is provided", async () => {
  act(() => setState({ externalPortals }));

  const { findByTestId, getByText, getByLabelText, user } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const searchInput = getByLabelText("Search this flow");
  user.type(searchInput, "ind");

  const externalPortalList = await waitFor(() =>
    findByTestId("searchExternalPortalList"),
  );

  expect(externalPortalList).toBeDefined();
  expect(getByText(/portalOne/)).toBeInTheDocument();
  expect(getByText(/portalTwo/)).toBeInTheDocument();
});

it("allows users to navigate to the external portals", async () => {
  act(() => setState({ externalPortals }));

  const { getAllByRole, getByLabelText, user } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const searchInput = getByLabelText("Search this flow");
  user.type(searchInput, "ind");

  const [first, second] = await waitFor(
    () => getAllByRole("link") as HTMLAnchorElement[],
  );
  expect(first).toHaveAttribute("href", "../myTeam/portalOne");
  expect(second).toHaveAttribute("href", "../myTeam/portalTwo");
});

it("should not have any accessibility violations on initial load", async () => {
  act(() => setState({ externalPortals }));

  const { container, getByLabelText, user, getByTestId } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const searchInput = getByLabelText("Search this flow");
  user.type(searchInput, "ind");

  await waitFor(() =>
    expect(getByTestId("searchExternalPortalList")).toBeInTheDocument(),
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
