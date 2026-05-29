import { screen, waitFor, within } from "@testing-library/react";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FeedbackLog } from "../FeedbackLog";
import { mockFeedback } from "../mocks/mockFeedback";
import { updateFeedbackStatus } from "../queries/updateFeedbackStatus";

vi.mock("../queries/updateFeedbackStatus", () => ({
  updateFeedbackStatus: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../queries/updateEditorNotes", () => ({
  updateEditorNotes: vi.fn().mockResolvedValue(undefined),
}));

const renderFeedbackLog = () => setup(<FeedbackLog feedback={mockFeedback} />);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ChangeStatusTool — 'Mark as' button state", () => {
  it("is disabled when no rows are selected", async () => {
    await renderFeedbackLog();
    expect(screen.getByRole("button", { name: /Mark as/i })).toBeDisabled();
  });

  it("becomes enabled after clicking a row checkbox", async () => {
    const { user } = await renderFeedbackLog();

    const checkboxes = screen.getAllByRole("checkbox");
    // Index 0 = "select all" checkbox
    // Index 1 = first data checkbox
    await user.click(checkboxes[1]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled();
    });
  });

  it("becomes disabled again after deselecting the row", async () => {
    const { user } = await renderFeedbackLog();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled(),
    );

    await user.click(checkboxes[1]);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeDisabled();
    });
  });
});

describe("ChangeStatusTool - opening the status menu", () => {
  it("opens a menu with all four status options when 'Mark as' is clicked", async () => {
    const { user } = await renderFeedbackLog();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: /Mark as/i }));

    await waitFor(() => {
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    expect(screen.getByRole("menuitem", { name: "Unread" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Urgent" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "In progress" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Actioned" })).toBeVisible();
  });

  it("closes the menu without calling the mutation when Escape is pressed", async () => {
    const { user } = await renderFeedbackLog();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: /Mark as/i }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    expect(vi.mocked(updateFeedbackStatus)).not.toHaveBeenCalled();
  });
});

describe("ChangeStatusTool — changing status (the reported bug)", () => {
  it("calls updateFeedbackStatus with the selected row id and chosen status", async () => {
    const { user } = await renderFeedbackLog();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: /Mark as/i }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());

    await user.click(screen.getByRole("menuitem", { name: "Actioned" }));

    await waitFor(() => {
      expect(vi.mocked(updateFeedbackStatus)).toHaveBeenCalledWith(
        [mockFeedback[0].id],
        "actioned",
      );
    });
  });

  it("calls updateFeedbackStatus with multiple selected row ids", async () => {
    const { user } = await renderFeedbackLog();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: /Mark as/i }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());

    await user.click(screen.getByRole("menuitem", { name: "Urgent" }));

    await waitFor(() => {
      expect(vi.mocked(updateFeedbackStatus)).toHaveBeenCalledWith(
        expect.arrayContaining([mockFeedback[0].id, mockFeedback[1].id]),
        "urgent",
      );
    });
  });

  it("deselects all rows after a successful status change", async () => {
    const { user } = await renderFeedbackLog();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: /Mark as/i }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
    await user.click(screen.getByRole("menuitem", { name: "Actioned" }));

    await waitFor(() =>
      expect(vi.mocked(updateFeedbackStatus)).toHaveBeenCalled(),
    );

    // Button disabled again means no rows are selected
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeDisabled();
    });
  });

  it("keeps rows selected when the mutation fails", async () => {
    vi.mocked(updateFeedbackStatus).mockRejectedValueOnce(
      new Error("network error"),
    );

    const { user } = await renderFeedbackLog();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: /Mark as/i }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
    await user.click(screen.getByRole("menuitem", { name: "Actioned" }));

    await waitFor(() =>
      expect(vi.mocked(updateFeedbackStatus)).toHaveBeenCalled(),
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled();
    });
  }, 75_000);

  it("updates the StatusChip in the row after a successful status change", async () => {
    const { user } = await renderFeedbackLog();

    const firstDataRow = screen.getAllByRole("row")[1];
    expect(within(firstDataRow).getByText("Unread")).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: /Mark as/i }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
    await user.click(screen.getByRole("menuitem", { name: "Actioned" }));

    await waitFor(() =>
      expect(vi.mocked(updateFeedbackStatus)).toHaveBeenCalled(),
    );

    await waitFor(() => {
      expect(
        within(screen.getAllByRole("row")[1]).getByText("Actioned"),
      ).toBeInTheDocument();
    });
  });

  it.each([
    ["Unread", "unread"],
    ["Urgent", "urgent"],
    ["In progress", "in_progress"],
    ["Actioned", "actioned"],
    ["Not relevant", "not_relevant"],
  ] as const)(
    "calls the mutation with status '%s' when '%s' menu item is clicked",
    async (label, status) => {
      const { user } = await renderFeedbackLog();

      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[1]);
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /Mark as/i })).toBeEnabled(),
      );

      await user.click(screen.getByRole("button", { name: /Mark as/i }));
      await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
      await user.click(screen.getByRole("menuitem", { name: label }));

      await waitFor(() => {
        expect(vi.mocked(updateFeedbackStatus)).toHaveBeenCalledWith(
          expect.any(Array),
          status,
        );
      });
    },
  );
});
