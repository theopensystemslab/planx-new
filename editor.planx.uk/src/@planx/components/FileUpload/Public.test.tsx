import { screen } from "@testing-library/react";
import { uniqueId } from "lodash";
import React from "react";
import { axe, setup } from "testUtils";

import FileUpload from "./Public";

test("renders correctly and blocks submit if there are no files added", async () => {
  const handleSubmit = jest.fn();

  setup(<FileUpload handleSubmit={handleSubmit} />);

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

  const { user } = setup(
    <FileUpload
      id={componentId}
      handleSubmit={handleSubmit}
      previouslySubmittedData={uploadedFile}
    />
  );

  await user.click(screen.getByTestId("continue-button"));

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

  const { user } = setup(
    <FileUpload
      fn={dataField}
      id={componentId}
      handleSubmit={handleSubmit}
      previouslySubmittedData={uploadedFile}
    />
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
      path: "placeholder.png",
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
  const handleSubmit = jest.fn();
  const componentId = uniqueId();

  const { container } = setup(
    <FileUpload
      id={componentId}
      handleSubmit={handleSubmit}
      description="description"
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
