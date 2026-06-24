import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "test/utils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import PublicFileUploadButton from "./PublicFileUploadButton";

vi.mock("lib/api/fileUpload/requests", () => ({
  uploadPublicFile: vi.fn().mockReturnValue(new Promise(() => {})),
}));

describe("PublicFileUploadButton", () => {
  it("renders a button with the default aria-label", async () => {
    await setup(<PublicFileUploadButton />);
    expect(
      screen.getByRole("button", { name: "Upload image" }),
    ).toBeInTheDocument();
  });

  it("uses a custom aria-label when provided", async () => {
    await setup(<PublicFileUploadButton aria-label="Insert image" />);
    expect(
      screen.getByRole("button", { name: "Insert image" }),
    ).toBeInTheDocument();
  });

  it("disables the button when the disabled prop is set", async () => {
    await setup(<PublicFileUploadButton disabled />);
    expect(screen.getByRole("button", { name: "Upload image" })).toBeDisabled();
  });

  it("shows aria-busy while a file is uploading", async () => {
    const { user } = await setup(<PublicFileUploadButton />);

    const input = screen.getByTestId("upload-file-input");
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    await user.upload(input, file);

    expect(
      screen.getByRole("button", { name: "Upload image" }),
    ).toHaveAttribute("aria-busy", "true");
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(<PublicFileUploadButton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
