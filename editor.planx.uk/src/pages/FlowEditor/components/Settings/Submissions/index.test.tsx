import { MockedProvider } from "@apollo/client/testing";
import { waitFor } from "@testing-library/react";
import { vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { axe, setup } from "testUtils";

import Submissions from "./index";
import { mockApplications, mockRequests } from "./mocks";

const { setState } = vanillaStore;

describe("Submissions Component", () => {
  test("no results message", async () => {
    setState({ flowSlug: "no-results-service", teamSlug: "test-team" });
    const { container, getByText } = setup(
      <MockedProvider mocks={mockRequests} addTypename={false}>
        <Submissions />
      </MockedProvider>,
    );

    expect(getByText("Submissions")).toBeInTheDocument();
    expect(
      getByText(
        "View data on the user submitted applications for this service.",
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getByText("No submitted applications found for this service."),
      ).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("basic view table with expected values", async () => {
    setState({ flowSlug: "test-service", teamSlug: "test-team" });
    const { container, getByText } = setup(
      <MockedProvider mocks={mockRequests} addTypename={false}>
        <Submissions />
      </MockedProvider>,
    );

    expect(getByText("Submissions")).toBeInTheDocument();
    expect(
      getByText(
        "View data on the user submitted applications for this service.",
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      mockApplications.forEach((app) => {
        expect(getByText(app.sessionId)).toBeInTheDocument();
      });
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("error renders as expected", async () => {
    setState({ flowSlug: "error-service", teamSlug: "test-team" });
    const { container, getByText } = setup(
      <MockedProvider mocks={mockRequests} addTypename={false}>
        <Submissions />
      </MockedProvider>,
    );

    expect(getByText("Submissions")).toBeInTheDocument();
    expect(
      getByText(
        "View data on the user submitted applications for this service.",
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText("An error occurred")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
