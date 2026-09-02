import { screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "test/utils";
import { it } from "vitest";

import EventsLogGrouped from "./components/EventsLogGrouped";
import { mockSubmissionsGrouped } from "./mockSubmissionsGrouped";

const handlers = [
  graphql.query("GetSubmissions", () =>
    HttpResponse.json({ data: { submissions: mockSubmissionsGrouped } }),
  ),
];

beforeEach(() => {
  server.use(...handlers);
});

describe("When the submissions log renders", () => {
  it("shows the expected headers and rows without an error", async () => {
    await setup(
      <EventsLogGrouped
        submissions={mockSubmissionsGrouped}
        error={undefined}
        loading={false}
      />,
    );
    const headers = ["Service", "Address", "Status", "Date", "Session ID"];
    headers.map((header) =>
      expect(
        screen.getByRole("columnheader", { name: header }),
      ).toBeInTheDocument(),
    );

    // test for a selection of row values
    expect(
      screen.getAllByRole("gridcell", { name: "Invited to pay" }),
    ).toHaveLength(1);

    expect(
      screen.getByRole("gridcell", {
        name: "126ec0c4-12f2-1209-aa09-11294ec3ee12",
      }),
    ).toBeVisible();

    expect(
      screen.getAllByRole("gridcell", {
        name: "Submit to BOPS failed",
      }),
    ).toHaveLength(1);

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
