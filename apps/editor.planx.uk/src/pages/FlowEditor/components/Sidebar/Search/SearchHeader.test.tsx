import { waitFor } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";
import { vi } from "vitest";

import Search from ".";
import { flow } from "./mocks/simple";
import { VirtuosoWrapper } from "./testUtils";

vi.mock("react-navi", () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
  }),
}));

beforeAll(() => useStore.setState({ flow }));

it("Displays a warning if no results are returned", async () => {
  const { getByLabelText, getByText, getByRole, user } = await setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const searchInput = getByLabelText("Search this flow");
  await user.type(searchInput, "Timbuktu");

  await waitFor(() =>
    expect(getByText("No matches found")).toBeInTheDocument(),
  );
  expect(getByRole("list")).toBeEmptyDOMElement();
});

it("Displays the count for a single result", async () => {
  const { getByLabelText, getByText, getAllByRole, getByRole, user } =
    await setup(
      <VirtuosoWrapper>
        <Search />
      </VirtuosoWrapper>,
    );

  const searchInput = getByLabelText("Search this flow");
  // "Norway" shares no letters with the other country options, so there's no fuzzy match from Fuse.js
  await user.type(searchInput, "Norway");

  await waitFor(() => expect(getByText("1 result:")).toBeInTheDocument());
  expect(getByRole("list")).not.toBeEmptyDOMElement();
  expect(getAllByRole("listitem")).toHaveLength(1);
});

it("Displays the count for multiple results", async () => {
  const { getByText, getByRole, getAllByRole, getByLabelText, user } =
    await setup(
      <VirtuosoWrapper>
        <Search />
      </VirtuosoWrapper>,
    );

  const searchInput = getByLabelText("Search this flow");
  // Matches "India" and "Indonesia"
  await user.type(searchInput, "Ind");

  await waitFor(() => expect(getByText("2 results:")).toBeInTheDocument());
  expect(getByRole("list")).not.toBeEmptyDOMElement();
  expect(getAllByRole("listitem")).toHaveLength(2);
});
