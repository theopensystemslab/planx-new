import { screen } from "@testing-library/react";
import React from "react";
import * as ReactNavi from "react-navi";
import { setup } from "testUtils";
import { it } from "vitest";

import EventsLog from "./components/EventsLog";
import { mockSubmissions } from "./mockSubmissions";

vi.spyOn(ReactNavi, "useNavigation").mockImplementation(
  () => ({ navigate: vi.fn() }) as any,
);

describe("When the submissions log renders", () => {
  it("shows the expected headers and rows without an error", async () => {
    await setup(
      <EventsLog
        submissions={mockSubmissions}
        error={undefined}
        loading={false}
      />,
    );
    const headers = [
      "Service",
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
    ).toHaveLength(1); // One submission in the mock data is this type

    expect(
      screen.getByRole("gridcell", {
        name: "126ec0c4-12f2-1209-aa09-11294ec3ee12",
      }),
    ).toBeVisible();

    expect(
      screen.getAllByRole("gridcell", {
        name: "Failed (500)",
      }),
    ).toHaveLength(2);

    expect(screen.getAllByRole("gridcell", { name: "Success" })).toHaveLength(
      1,
    );

    expect(screen.getAllByText("Dsn impact metrics")).toHaveLength(1);
    expect(screen.getAllByText("Report a breach")).toHaveLength(1);
    expect(
      screen.getAllByText("Apply for a lawful development certificate"),
    ).toHaveLength(1);
  }, 20_000);
});
