import { waitFor } from "@storybook/testing-library";
import React from "react";
import { axe, setup } from "testUtils";

import { mockApplications } from "./mocks";
import SubmissionsView from "./SubmissionsView";

describe("SubmissionsView Component", () => {
  test("displays the loading indicator when loading", async () => {
    const { container, getByTestId } = setup(
      <SubmissionsView applications={[]} loading={true} error={undefined} />,
    );
    await waitFor(() => {
      expect(getByTestId("delayed-loading-indicator")).toBeInTheDocument();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("displays the error message when there is an error", async () => {
    const errorMessage = "Test error message";
    const { container, getByText } = setup(
      <SubmissionsView
        applications={[]}
        loading={false}
        error={new Error(errorMessage)}
      />,
    );
    expect(getByText(errorMessage)).toBeInTheDocument();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("displays a message when there are no applications", async () => {
    const { container, getByText } = setup(
      <SubmissionsView applications={[]} loading={false} error={undefined} />,
    );
    expect(
      getByText("No submitted applications found for this service."),
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("displays the submissions table when there are applications", async () => {
    const { container, getByText } = setup(
      <SubmissionsView
        applications={mockApplications}
        loading={false}
        error={undefined}
      />,
    );
    mockApplications.forEach((app) => {
      expect(getByText(app.sessionId)).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
