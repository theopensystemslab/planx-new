import { Screen, waitFor } from "@testing-library/react";

import { mockSetRecords } from "./mocks";

/**
 * When we type into the search box a search spinner
 * appears while we search for the results
 */
export const waitForSearchSpinner = async (screen: Screen) => {
  await waitFor(() => {
    const searchSpinner = screen.queryByRole("button", {
      name: "is searching",
    });
    expect(searchSpinner).not.toBeInTheDocument();
  });
};

/**
 * When we have finished searching and have the results ready,
 * a clear icon will appear in the search box
 * replacing the search spinner
 */
export const waitForClearSearchIcon = async (screen: Screen) => {
  await waitFor(() => {
    const clearIcon = screen.queryByRole("button", {
      name: "clear search",
    });
    expect(clearIcon).toBeInTheDocument();
  });
};

/**
 * When we type 'mock' into the search box
 * we would expect these results from the mocks
 */
export const checkForFirstSearchResults = async () => {
  expect(mockSetRecords).toHaveBeenLastCalledWith([
    {
      name: "Apply for a certificate",
      slug: "apply-for-a-ceritifcate",
    },
    {
      name: "Apply for an article 4 direction",
      slug: "apply-for-an-article-4-direction",
    },
  ]);
};
