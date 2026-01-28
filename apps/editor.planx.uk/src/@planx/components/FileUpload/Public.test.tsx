import { screen } from "@testing-library/react";
import { uniqueId } from "lodash";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { PASSPORT_REQUESTED_FILES_KEY } from "../FileUploadAndLabel/model";
import FileUpload from "./Public";

test("renders correctly", async () => {
  const handleSubmit = vi.fn();

  await setup(
    <FileUpload
      title="Please upload your files"
      fn="someKey"
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test("shows error if user tries to continue before adding files", async () => {
  const handleSubmit = vi.fn();

  const { user } = await setup(
    <FileUpload
      title="Please upload your files"
      fn="elevations"
      id="elevations"
      handleSubmit={handleSubmit}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));
  expect(screen.getByText(/Upload at least one file/)).toBeInTheDocument();

  // Blocked by validation error
  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test("recovers previously submitted files when clicking the back button", async () => {
  const handleSubmit = vi.fn();
  const componentId = uniqueId();
  const dataField = "data-field";
  const uploadedFile = {
    data: {
      [dataField]: [dummyFile],
      [PASSPORT_REQUESTED_FILES_KEY]: {
        required: [dataField],
        recommended: [],
        optional: [],
      },
    },
  };

  const { user } = await setup(
    <FileUpload
      title="Please upload your files"
      fn={dataField}
      id={componentId}
      handleSubmit={handleSubmit}
      previouslySubmittedData={uploadedFile}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith(uploadedFile);
});

test.todo("cannot continue until uploads have finished");

const dummyFile = {
  url: "http://localhost:7002/file/private/y2uubi9x/placeholder.png",
  filename: "placeholder.png",
  cachedSlot: {
    file: {
      name: "placeholder.png",
      path: "./placeholder.png",
      type: "image/png",
      size: 6146,
    },
    status: "success",
    progress: 1,
    id: "oPd5GUV_T-bWZWJb0wGs8",
    url: "http://localhost:7002/file/private/y2uubi9x/placeholder.png",
  },
};

it("should not have any accessibility violations", async () => {
  const handleSubmit = vi.fn();
  const componentId = uniqueId();

  const { container } = await setup(
    <FileUpload
      title="Please upload your files"
      fn="someKey"
      id={componentId}
      handleSubmit={handleSubmit}
      description="description"
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
