import { Screen, waitFor } from "@testing-library/react";
import { mockSetRecords } from "./mocks";

export const waitForSearchSpinner = async (screen: Screen) => {
  await waitFor(() => {
    const searchSpinner = screen.queryByRole("button", {
      name: "is searching",
    });
    expect(searchSpinner).not.toBeInTheDocument();
  });
};

export const waitForClearSearchIcon = async (screen: Screen) => {
  await waitFor(() => {
    const clearIcon = screen.queryByRole("button", {
      name: "clear search",
    });
    expect(clearIcon).toBeInTheDocument();
  });
};

export const checkForSearchResults = async () => {
  expect(mockSetRecords).toHaveBeenCalledWith([
    {
      name: "Search for me",
      slug: "search-for-me",
    },
    {
      name: "Do not search for me",
      slug: "do-not-search-for-me",
    },
  ]);
};
