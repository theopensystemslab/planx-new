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

test("cannot continue until uploads have finished", async () => {
  const handleSubmit = vi.fn();
  const componentId = uniqueId();
  const dataField = "data-field";

  const uploadingFile = {
    url: undefined,
    filename: "placeholder.png",
    cachedSlot: {
      file: {
        name: "placeholder.png",
        path: "./placeholder.png",
        type: "image/png",
        size: 6146,
      },
      status: "uploading",
      progress: 0.5,
      id: "uploading-id",
      url: undefined,
      drawingNumber: undefined,
    },
  };

  const { user } = await setup(
    <FileUpload
      title="Please upload your files"
      fn={dataField}
      id={componentId}
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: {
          [dataField]: [uploadingFile],
          [PASSPORT_REQUESTED_FILES_KEY]: {
            required: [dataField],
            recommended: [],
            optional: [],
          },
        },
      }}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));
  expect(
    screen.getByText(/Please wait for upload to complete/),
  ).toBeInTheDocument();
  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

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

test("shows singular 'Drop file here' text when maxFiles is 1", async () => {
  const handleSubmit = vi.fn();
  const componentId = uniqueId();

  await setup(
    <FileUpload
      title="Upload single file"
      fn="singleFile"
      id={componentId}
      handleSubmit={handleSubmit}
      maxFiles={1}
    />,
  );

  expect(screen.getByText(/Drop file here/)).toBeInTheDocument();
  expect(screen.queryByText(/Drop files here/)).not.toBeInTheDocument();
});

describe("drawing numbers", () => {
  const dataField = "data-field";

  const previouslySubmittedDataWithFile = (dataField: string) => ({
    data: {
      [dataField]: [dummyFile],
      [PASSPORT_REQUESTED_FILES_KEY]: {
        required: [dataField],
        recommended: [],
        optional: [],
      },
    },
  });

  test("does not show a drawing number field by default", async () => {
    await setup(
      <FileUpload
        title="Please upload your files"
        fn={dataField}
        handleSubmit={vi.fn()}
        previouslySubmittedData={previouslySubmittedDataWithFile(dataField)}
      />,
    );

    expect(screen.queryByText(/Drawing number/i)).not.toBeInTheDocument();
  });

  test("shows a drawing number field for each file when showDrawingNumber is true", async () => {
    await setup(
      <FileUpload
        title="Please upload your files"
        fn={dataField}
        handleSubmit={vi.fn()}
        showDrawingNumber={true}
        previouslySubmittedData={previouslySubmittedDataWithFile(dataField)}
      />,
    );

    expect(
      screen.getByText(/Drawing number \(optional\)/i),
    ).toBeInTheDocument();
  });

  test("allows submission without a drawing number when showDrawingNumber is true", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <FileUpload
        title="Please upload your files"
        fn={dataField}
        handleSubmit={handleSubmit}
        showDrawingNumber={true}
        previouslySubmittedData={previouslySubmittedDataWithFile(dataField)}
      />,
    );

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          [dataField]: expect.arrayContaining([
            expect.objectContaining({ drawingNumber: undefined }),
          ]),
        }),
      }),
    );
  });

  test("maps the drawing number to the submitted data", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <FileUpload
        title="Please upload your files"
        fn={dataField}
        handleSubmit={handleSubmit}
        showDrawingNumber={true}
        previouslySubmittedData={previouslySubmittedDataWithFile(dataField)}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: /Drawing number/i }),
      "ABC-12345",
    );
    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          [dataField]: expect.arrayContaining([
            expect.objectContaining({ drawingNumber: "ABC-12345" }),
          ]),
        }),
      }),
    );
  });
});
