import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { uniqueId } from "lodash";
import React from "react";
import { axe } from "testUtils";

import FileUpload from "./Public";

test("renders correctly and blocks submit if there are no files added", async () => {
  const handleSubmit = jest.fn();

  render(<FileUpload handleSubmit={handleSubmit} />);

  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test("recovers previously submitted files when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();
  const uploadedFile = {
    data: {
      [componentId]: [dummyFile],
    },
  };

  render(
    <FileUpload
      id={componentId}
      handleSubmit={handleSubmit}
      previouslySubmittedData={uploadedFile}
    />
  );

  await userEvent.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith(uploadedFile);
});

test("recovers previously submitted files when clicking the back button even if a data field is set", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();
  const dataField = "data-field";
  const uploadedFile = {
    data: {
      [dataField]: [dummyFile],
    },
  };

  render(
    <FileUpload
      fn={dataField}
      id={componentId}
      handleSubmit={handleSubmit}
      previouslySubmittedData={uploadedFile}
    />
  );

  await userEvent.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith(uploadedFile);
});

test.todo("cannot continue until uploads have finished");

const dummyFile = {
  url: "http://127.0.0.1:9000/planx-temp/4oh73out/PXL_20210327_122515714.pdf",
  filename: "PXL_20210327_122515714.pdf",
  cachedSlot: {
    file: {
      path: "PXL_20210327_122515714.pdf",
      type: "application/pdf",
    },
    status: "success",
    progress: 1,
    id: "2vBmuynz-3D_EN-H2gF2E",
    url: "http://127.0.0.1:9000/planx-temp/4oh73out/PXL_20210327_122515714.pdf",
  },
};

it("should not have any accessibility violations", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();

  const { container } = render(
    <FileUpload
      id={componentId}
      handleSubmit={handleSubmit}
      description="description"
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
