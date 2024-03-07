import { waitFor } from "@testing-library/react";
import { fetchSubmittedApplications } from "lib/applications";
import { vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { axe, setup } from "testUtils";

import Submissions from "./index";
import { mockApplications } from "./mocks";

const { setState } = vanillaStore;

jest.mock("lib/applications", () => ({
  fetchSubmittedApplications: jest.fn(),
}));

const mockFetchSubmittedApplications =
  fetchSubmittedApplications as jest.MockedFunction<
    typeof fetchSubmittedApplications
  >;

describe("Submissions presentation and functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders basic component when store data not available", () => {
    const { getByText } = setup(<Submissions />);
    expect(getByText("Submissions")).toBeInTheDocument();
    expect(
      getByText("No submitted applications were found for this service."),
    ).toBeInTheDocument();
  });

  test("renders applications table when results are found", async () => {
    mockFetchSubmittedApplications.mockResolvedValue({
      applications_summary: mockApplications,
    });

    setState({ flowSlug: "apply-for", teamSlug: "council-team" });
    const { getByText } = setup(<Submissions />);

    await waitFor(() => {
      expect(fetchSubmittedApplications).toBeCalledTimes(1);
      expect(fetchSubmittedApplications).toHaveBeenCalledWith(
        "apply-for",
        "council-team",
      );
      expect(
        getByText("30fa23e6-d701-4e21-9c4a-5764e0a80c14"),
      ).toBeInTheDocument();
      expect(
        getByText("d347cdad-77d6-4139-9c4a-3bf19d54ef49"),
      ).toBeInTheDocument();
      expect(
        getByText("54cbc3f1-6f05-4088-a48a-706e8d224363"),
      ).toBeInTheDocument();
    });
  });

  test("renders no applications found when no results returned", async () => {
    mockFetchSubmittedApplications.mockResolvedValue({
      applications_summary: [],
    });

    setState({ flowSlug: "apply-for", teamSlug: "council-team" });
    const { getByText, queryByText } = setup(<Submissions />);

    await waitFor(() => {
      expect(fetchSubmittedApplications).toBeCalledTimes(1);
      expect(fetchSubmittedApplications).toHaveBeenCalledWith(
        "apply-for",
        "council-team",
      );
      expect(
        getByText("No submitted applications were found for this service."),
      ).toBeInTheDocument();
      expect(
        queryByText("30fa23e6-d701-4e21-9c4a-5764e0a80c14"),
      ).not.toBeInTheDocument();
    });
  });

  test("renders error when API call fails", async () => {
    mockFetchSubmittedApplications.mockRejectedValue(
      new Error("API call failed"),
    );

    setState({ flowSlug: "apply-for", teamSlug: "council-team" });
    const { getByText, queryByText } = setup(<Submissions />);

    await waitFor(() => {
      expect(fetchSubmittedApplications).toBeCalledTimes(1);
      expect(fetchSubmittedApplications).toHaveBeenCalledWith(
        "apply-for",
        "council-team",
      );
      expect(
        queryByText("No submitted applications were found for this service."),
      ).not.toBeInTheDocument();
      expect(
        queryByText("30fa23e6-d701-4e21-9c4a-5764e0a80c14"),
      ).not.toBeInTheDocument();
      expect(getByText("API call failed")).toBeInTheDocument();
    });
  });
});

describe("Submissions accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders basic view with no accessibility violations", async () => {
    mockFetchSubmittedApplications.mockResolvedValue({
      applications_summary: [],
    });

    setState({ flowSlug: "apply-for", teamSlug: "council-team" });
    const { container, getByText } = setup(<Submissions />);

    await waitFor(() => {
      expect(
        getByText("No submitted applications were found for this service."),
      ).toBeInTheDocument();
    });

    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });

  test("renders applications data with no accessibility violations", async () => {
    mockFetchSubmittedApplications.mockResolvedValue({
      applications_summary: mockApplications,
    });

    setState({ flowSlug: "apply-for", teamSlug: "council-team" });
    const { container, getByText } = setup(<Submissions />);

    await waitFor(() => {
      expect(
        getByText("30fa23e6-d701-4e21-9c4a-5764e0a80c14"),
      ).toBeInTheDocument();
    });

    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });

  test("renders error view with no accessibility violations", async () => {
    mockFetchSubmittedApplications.mockRejectedValue(
      new Error("API call failed"),
    );

    setState({ flowSlug: "apply-for", teamSlug: "council-team" });
    const { container, getByText } = setup(<Submissions />);

    await waitFor(() => {
      expect(getByText("API call failed")).toBeInTheDocument();
    });

    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });
});
