import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { it } from "vitest";

import { FeedbackLog } from "../FeedbackLog";
import { mockFeedback } from "../mocks/mockFeedback";

describe("When the feedback log renders", () => {
  it("shows the expected headers and rows without an error", async () => {
    await setup(<FeedbackLog feedback={mockFeedback} />);
    const headers = [
      "Type",
      "Date",
      "Rating",
      "Comment",
      "Property address",
      "Project type",
      "Where",
      "What were you doing?",
      "Help text (more information)",
      "Browser",
      "Device",
    ];
    headers.map((header) =>
      expect(
        screen.getByRole("columnheader", { name: header }),
      ).toBeInTheDocument(),
    );

    // test for a selection of row values
    expect(
      screen.getByRole("gridcell", { name: "Report a planning breach" }),
    ).toBeVisible();

    expect(
      screen.getByRole("gridcell", {
        name: "6, TEST LANE, ST ALBANS, HERTFORDSHIRE, AL1 1AA",
      }),
    ).toBeVisible();

    expect(screen.getByRole("gridcell", { name: "Same error" })).toBeVisible();

    expect(screen.getAllByText("Issue")).toHaveLength(4); // Four pieces of feedback are issues in the mock data
  }, 75_000);
});
