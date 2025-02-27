import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { it } from "vitest";

import EventsLog from "./components/EventsLog";
import { mockSubmissions } from "./mockSubmissions";

describe("When the feedback log renders", () => {
  it("shows the expected headers and rows without an error", () => {
    setup(
      <EventsLog
        submissions={mockSubmissions}
        error={undefined}
        loading={false}
      />,
    );
    const headers = [
      "Flow name",
      "Event",
      "Status",
      "Date",
      "Session ID",
      "Response",
    ];
    headers.map((header) =>
      expect(
        screen.getByRole("columnheader", { name: header }),
      ).toBeInTheDocument(),
    );

    // test for a selection of row values
    expect(
      screen.getAllByRole("gridcell", { name: "Send to email" }),
    ).toHaveLength(2); // Two submissions in the mock data are this type

    expect(
      screen.getByRole("gridcell", {
        name: "c64eefbe-bb2d-47c8-94de-d4776e09af04",
      }),
    ).toBeVisible();

    expect(
      screen.getByRole("gridcell", {
        name: "Failed (500)",
      }),
    ).toBeVisible();

    expect(screen.getAllByRole("gridcell", { name: "Success" })).toHaveLength(
      5,
    );

    expect(screen.getAllByText("Apply for planning permission")).toHaveLength(
      4,
    ); // Four submissions in the mock data are from this flow
  });
});
