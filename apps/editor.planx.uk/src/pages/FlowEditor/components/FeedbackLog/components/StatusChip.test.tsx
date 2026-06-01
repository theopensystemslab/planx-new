import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import { screen } from "@testing-library/react";
import { setup } from "test/utils";
import { describe, expect, it } from "vitest";

import { Feedback, FeedbackStatus } from "../types";
import { StatusChip } from "./StatusChip";

const makeParams = (value: FeedbackStatus | undefined) =>
  ({
    value,
    row: {} as Feedback,
    field: "status",
    id: 1,
    colDef: {},
    rowNode: {},
    cellMode: "view",
    hasFocus: false,
    tabIndex: -1,
    api: {},
    formattedValue: value,
  }) as unknown as GridRenderCellParams<
    Feedback,
    Feedback["status"],
    "singleSelect",
    GridTreeNodeWithRender
  >;

describe("StatusChip", () => {
  it.each([
    ["unread", "Unread", "MuiChip-colorInfo"],
    ["urgent", "Urgent", "MuiChip-colorError"],
    ["in_progress", "In progress", "MuiChip-colorWarning"],
    ["actioned", "Actioned", "MuiChip-colorSuccess"],
    ["not_relevant", "Not relevant", "MuiChip-colorSecondary"],
  ] as const)(
    "renders '%s' label with correct colour class for status '%s'",
    async (status, label, colourClass) => {
      const { container } = await setup(<StatusChip {...makeParams(status)} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(container.querySelector(`.${colourClass}`)).toBeInTheDocument();
    },
  );

  it("renders nothing when value is undefined", async () => {
    await setup(<StatusChip {...makeParams(undefined)} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
