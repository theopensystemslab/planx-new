import React from "react";
import { axe, setup } from "testUtils";

import ApplicationsTable from "./ApplicationsTable";
import { mockApplications } from "./mocks";

describe("ApplicationsTable renders as expected", () => {
  test("renders expected table headers", () => {
    const { getByText } = setup(
      <ApplicationsTable applications={mockApplications} />,
    );
    expect(getByText("Session ID")).toBeInTheDocument();
    expect(getByText("Submitted At")).toBeInTheDocument();
    expect(getByText("User Invited To Pay")).toBeInTheDocument();
    expect(getByText("Payment Status")).toBeInTheDocument();
    expect(getByText("Amount")).toBeInTheDocument();
    expect(getByText("Payment Date")).toBeInTheDocument();
    expect(getByText("Sent To Email")).toBeInTheDocument();
    expect(getByText("Sent To BOPS")).toBeInTheDocument();
    expect(getByText("Sent To Uniform")).toBeInTheDocument();
  });

  test("renders data for each application", () => {
    const { getByText } = setup(
      <ApplicationsTable applications={mockApplications} />,
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

  test("renders date in correct format", () => {
    const { getByText } = setup(
      <ApplicationsTable applications={[mockApplications[0]]} />,
    );
    expect(getByText("20/01/2024")).toBeInTheDocument();
  });

  test("renders payment amount in correct format", () => {
    const { getByText } = setup(
      <ApplicationsTable applications={[mockApplications[0]]} />,
    );
    expect(getByText("£129.00")).toBeInTheDocument();
  });

  test("renders booleans correctly", () => {
    const { getAllByText } = setup(
      <ApplicationsTable applications={[mockApplications[0]]} />,
    );
    expect(getAllByText("Yes")).toHaveLength(3);
    expect(getAllByText("No")).toHaveLength(1);
  });

  test("renders N/A from view", () => {
    const { getAllByText } = setup(
      <ApplicationsTable applications={[mockApplications[2]]} />,
    );
    expect(getAllByText("N/A")).toHaveLength(2);
  });

  test("renders with no accessibility violations", async () => {
    const { container } = setup(
      <ApplicationsTable applications={mockApplications} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
