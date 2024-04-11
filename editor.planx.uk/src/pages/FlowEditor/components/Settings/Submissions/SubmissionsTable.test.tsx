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

  test("renders the session ids", () => {
    const { getByText } = setup(
      <SubmissionsTable applications={mockApplications} />,
    );

    mockApplications.forEach((app) => {
      expect(getByText(app.sessionId)).toBeInTheDocument();
    });
  });

  test("renders payment request ids when available", () => {
    const { getByText } = setup(
      <SubmissionsTable applications={mockApplications} />,
    );

    expect(getByText(/test-payment-request-2/)).toBeInTheDocument();
    expect(getByText(/test-payment-request-1/)).toBeInTheDocument();
  });

  test("renders the latest payment status for each session", () => {
    const { getAllByText } = setup(
      <SubmissionsTable applications={mockApplications} />,
    );

    expect(getAllByText(/Status: created/)).toHaveLength(3);
    expect(getAllByText(/Status: error/)).toHaveLength(1);
    expect(getAllByText(/Status: success/)).toHaveLength(2);
  });

  test("renders bops application ids when available", () => {
    const { getByText } = setup(
      <SubmissionsTable applications={mockApplications} />,
    );

    expect(getByText(/test-bops-1/)).toBeInTheDocument();
  });

  test("renders uniform application ids when available", () => {
    const { getByText } = setup(
      <SubmissionsTable applications={mockApplications} />,
    );

    expect(getByText(/test-uniform-1/)).toBeInTheDocument();
    expect(getByText(/test-uniform-2/)).toBeInTheDocument();
  });

  test("renders email application recipients when available", () => {
    const { getByText } = setup(
      <SubmissionsTable applications={mockApplications} />,
    );

    expect(getByText(/test-user-1@opensystemslab.io/)).toBeInTheDocument();
    expect(getByText(/test-user-2@opensystemslab.io/)).toBeInTheDocument();
    expect(getByText(/test-user-3@opensystemslab.io/)).toBeInTheDocument();
  });

  test("renders with no accessibility violations", async () => {
    const { container } = setup(
      <SubmissionsTable applications={mockApplications} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
