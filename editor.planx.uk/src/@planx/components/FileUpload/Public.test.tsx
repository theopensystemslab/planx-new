import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { uniqueId } from "lodash";
import React from "react";

import FileUpload from "./Public";

test("renders correctly and blocks submit if there are no files added", async () => {
  const handleSubmit = jest.fn();

  render(<FileUpload handleSubmit={handleSubmit} />);

  await act(async () => {
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test("recovers previously submitted files when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();
  const uploadedFile = {
    data: {
      [componentId]: [
        {
          url:
            "http://127.0.0.1:9000/planx-temp/4oh73out/PXL_20210327_122515714.pdf",
          filename: "PXL_20210327_122515714.pdf",
          cachedSlot: {
            file: {
              path: "PXL_20210327_122515714.pdf",
              type: "application/pdf",
            },
            status: "success",
            progress: 1,
            id: "2vBmuynz-3D_EN-H2gF2E",
            url:
              "http://127.0.0.1:9000/planx-temp/4oh73out/PXL_20210327_122515714.pdf",
          },
        },
      ],
    },
  };

  render(
    <FileUpload
      id={componentId}
      handleSubmit={handleSubmit}
      previouslySubmittedData={uploadedFile}
    />
  );

  await act(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith(uploadedFile);
});

test.todo("cannot continue until uploads have finished");
