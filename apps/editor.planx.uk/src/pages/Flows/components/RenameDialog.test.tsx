import { screen, waitFor } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RenameDialog } from "./RenameDialog";

const flow = {
  id: "flow-123",
  name: "Apply for a lawful development certificate",
  slug: "apply-for-a-lawful-development-certificate",
};

const renameFlowSpy = vi.fn();

const handlers = [
  graphql.query("GetFlows", () => HttpResponse.json({ data: { flows: [] } })),
  graphql.mutation("RenameFlow", ({ variables }) => {
    renameFlowSpy(variables);
    return HttpResponse.json({
      data: {
        flow: { id: flow.id, name: variables.newName, slug: variables.newSlug },
      },
    });
  }),
];

const renderDialog = (handleClose = vi.fn()) =>
  setup(
    <RenameDialog
      mode="rename"
      isDialogOpen
      handleClose={handleClose}
      flow={flow}
      teamId={1}
    />,
  );

describe("RenameDialog confirmation step", () => {
  beforeEach(() => {
    renameFlowSpy.mockClear();
    server.use(...handlers);
  });

  it("shows a warning step instead of renaming immediately when the slug changes", async () => {
    const { user } = await renderDialog();

    const nameInput = screen.getByLabelText("Flow name");
    await user.clear(nameInput);
    await user.type(nameInput, "A brand new name");
    await user.click(screen.getByRole("button", { name: "Rename flow" }));

    // Warning is shown, mutation has not fired yet
    expect(
      await screen.findByText("Renaming will break existing links"),
    ).toBeVisible();
    expect(renameFlowSpy).not.toHaveBeenCalled();
  });

  it("returns to the edit form when 'Back' is clicked on the warning step", async () => {
    const { user } = await renderDialog();

    const nameInput = screen.getByLabelText("Flow name");
    await user.clear(nameInput);
    await user.type(nameInput, "A brand new name");
    await user.click(screen.getByRole("button", { name: "Rename flow" }));

    await screen.findByText("Renaming will break existing links");
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByLabelText("Flow name")).toHaveValue("A brand new name");
    expect(
      screen.queryByText("Renaming will break existing links"),
    ).not.toBeInTheDocument();
    expect(renameFlowSpy).not.toHaveBeenCalled();
  });

  it("renames only after the warning is confirmed", async () => {
    const handleClose = vi.fn();
    const { user } = await renderDialog(handleClose);

    const nameInput = screen.getByLabelText("Flow name");
    await user.clear(nameInput);
    await user.type(nameInput, "A brand new name");
    await user.click(screen.getByRole("button", { name: "Rename flow" }));

    await screen.findByText("Renaming will break existing links");
    await user.click(screen.getByRole("button", { name: "Rename flow" }));

    await waitFor(() => expect(renameFlowSpy).toHaveBeenCalledTimes(1));
    expect(renameFlowSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        flowId: flow.id,
        newName: "A brand new name",
        newSlug: "a-brand-new-name",
      }),
    );
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });
});
