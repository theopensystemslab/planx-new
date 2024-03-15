import React from "react";
import { axe, setup } from "testUtils";

import { mockApplications } from "./mocks";
import SubmissionsTable from "./SubmissionsTable";

describe("SubmissionsTable renders as expected", () => {
  test("renders expected table headers", () => {
    const { getByText } = setup(
      <SubmissionsTable applications={mockApplications} />,
    );
    expect(getByText("Session ID")).toBeInTheDocument();
    expect(getByText("Submitted At")).toBeInTheDocument();
    expect(getByText("Payment Requests")).toBeInTheDocument();
    expect(getByText("Payment Status")).toBeInTheDocument();
    expect(getByText("BOPS Applications")).toBeInTheDocument();
    expect(getByText("Uniform Applications")).toBeInTheDocument();
    expect(getByText("Email Applications")).toBeInTheDocument();
  });

  test("renders with no accessibility violations", async () => {
    const { container } = setup(
      <SubmissionsTable applications={mockApplications} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
