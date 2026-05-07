import { screen, waitFor, within } from "@testing-library/react";
import { setup } from "test/utils";
import { it, vi } from "vitest";

import { FeedbackLog } from "./FeedbackLog";
import { mockFeedback } from "./mocks/mockFeedback";
import { updateEditorNotes } from "./queries/updateEditorNotes";

vi.mock("./queries/updateEditorNotes", () => ({
  updateEditorNotes: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./queries/updateFeedbackStatus", () => ({
  updateFeedbackStatus: vi.fn().mockResolvedValue(undefined),
}));

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
  });
});

describe("When the feedback array is empty", () => {
  it("shows a 'no feedback for this service' message when isFlowLevel is true", async () => {
    await setup(<FeedbackLog feedback={[]} isFlowLevel={true} />);
    expect(
      screen.getByText("No feedback found for this service"),
    ).toBeInTheDocument();
  });

  it("shows a 'no feedback for this team' message when isFlowLevel is not set", async () => {
    await setup(<FeedbackLog feedback={[]} />);
    expect(
      screen.getByText("No feedback found for this team"),
    ).toBeInTheDocument();
  });
});

describe("Descriptive text at flow vs team level", () => {
  it("references 'this service' when isFlowLevel is true", async () => {
    await setup(<FeedbackLog feedback={mockFeedback} isFlowLevel={true} />);
    expect(
      screen.getByText(/Feedback reports from users about this service/),
    ).toBeInTheDocument();
  });

  it("references 'all services in this team' when isFlowLevel is false", async () => {
    await setup(<FeedbackLog feedback={mockFeedback} isFlowLevel={false} />);
    expect(
      screen.getByText(
        /Feedback reports from users about all services in this team/,
      ),
    ).toBeInTheDocument();
  });
});

describe("Editor notes inline editing", () => {
  it("calls updateEditorNotes when an editor notes cell is committed", async () => {
    const { user } = await setup(
      <FeedbackLog feedback={mockFeedback} isFlowLevel={true} />,
    );

    // Two rows share "This is important!" — take the first one
    const notesCell = screen.getAllByRole("gridcell", {
      name: "This is important!",
    })[0];

    // Double-click to enter edit mode
    await user.dblClick(notesCell);

    const input = within(notesCell).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Updated note");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(vi.mocked(updateEditorNotes)).toHaveBeenCalledWith(
        expect.objectContaining({ id: 994, editorNotes: "Updated note" }),
      );
    });
  });
});
