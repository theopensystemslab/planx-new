import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import axios from "axios";
import React from "react";
import { axe, setup } from "testUtils";

import { mockFileTypes } from "./mocks";
import { Condition } from "./model";
import MultipleFileUploadComponent from "./Public";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

window.URL.createObjectURL = jest.fn();

describe("Basic state and setup", () => {
  test("renders correctly", async () => {
    setup(
      <MultipleFileUploadComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />
    );

    expect(screen.getAllByRole("heading")[0]).toHaveTextContent("Test title");

    // Required file is listed
    expect(screen.getByText("testKey")).toBeVisible();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <MultipleFileUploadComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Modal trigger", () => {
  afterEach(() => jest.clearAllMocks());

  test("Modal does not open on initial component render", async () => {
    setup(
      <MultipleFileUploadComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />
    );

    const fileTaggingModal = within(document.body).queryByTestId(
      "file-tagging-dialog"
    );

    expect(fileTaggingModal).not.toBeInTheDocument();
  });

  test("Modal opens when a single file is uploaded", async () => {
    const { user } = setup(
      <MultipleFileUploadComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />
    );
    const mockedPost = mockedAxios.post.mockResolvedValue({
      data: {
        file_type: "image/png",
        fileUrl: "https://api.editor.planx.dev/file/private/gws7l5d1/test.jpg",
      },
    });

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, file);
    expect(mockedPost).toHaveBeenCalled();

    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog"
    );
    expect(fileTaggingModal).toBeVisible();

    expect(await within(fileTaggingModal).findByText("test.png")).toBeVisible();
  });

  test("Modal opens when multiple files are uploaded", async () => {
    const { user } = setup(
      <MultipleFileUploadComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />
    );

    const mockedPost = mockedAxios.post
      .mockResolvedValueOnce({
        data: {
          file_type: "image/png",
          fileUrl:
            "https://api.editor.planx.dev/file/private/gws7l5d1/test1.jpg",
        },
      })
      .mockResolvedValueOnce({
        data: {
          file_type: "image/png",
          fileUrl:
            "https://api.editor.planx.dev/file/private/gws7l5d1/test2.jpg",
        },
      });

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const file2 = new File(["test2"], "test2.png", { type: "image/png" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, [file1, file2]);
    expect(mockedPost).toHaveBeenCalledTimes(2);

    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog"
    );
    expect(
      await within(fileTaggingModal).findByText("test1.png")
    ).toBeVisible();
    expect(
      await within(fileTaggingModal).findByText("test2.png")
    ).toBeVisible();
  });

  test("Modal does not open when a file is deleted", async () => {
    const { user } = setup(
      <MultipleFileUploadComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />
    );

    // Upload two files
    mockedAxios.post
      .mockResolvedValueOnce({
        data: {
          file_type: "image/png",
          fileUrl:
            "https://api.editor.planx.dev/file/private/gws7l5d1/test1.jpg",
        },
      })
      .mockResolvedValueOnce({
        data: {
          file_type: "image/png",
          fileUrl:
            "https://api.editor.planx.dev/file/private/gws7l5d1/test2.jpg",
        },
      });

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const file2 = new File(["test2"], "test2.png", { type: "image/png" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, [file1, file2]);

    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog"
    );

    // Close modal
    const closeModalButton = await within(fileTaggingModal).findByText(
      "Cancel"
    );
    expect(closeModalButton).toBeVisible();
    user.click(closeModalButton);
    await waitFor(() => expect(fileTaggingModal).not.toBeVisible());

    // Uploaded files displayed as cards
    expect(screen.getByText("test1.png")).toBeVisible();
    expect(screen.getByText("test2.png")).toBeVisible();

    // Delete the second file
    user.click(screen.getByLabelText("Delete test2.png"));

    // Card removed from screen
    await waitFor(() =>
      expect(screen.queryByText("test2.png")).not.toBeInTheDocument()
    );

    // Modal not open
    expect(fileTaggingModal).not.toBeVisible();
  });
});

describe("Adding tags and syncing state", () => {
  test.skip("Continue is enabled when all required file types are uploaded and tagged", async () => {
    const handleSubmit = jest.fn();
    const { user } = setup(
      <MultipleFileUploadComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={[
          {
            fn: "roofPlan",
            name: "Roof plan",
            rule: {
              condition: Condition.AlwaysRequired,
            },
          },
          {
            fn: "elevations",
            name: "Elevations",
            rule: {
              condition: Condition.AlwaysRequired,
            },
            moreInformation: {
              info: "<p>Help text</p>",
            },
          },
          {
            fn: "heritage",
            name: "Heritage statement",
            rule: {
              condition: Condition.AlwaysRecommended,
            },
            moreInformation: {
              info: "<p>Help text</p>",
            },
          },
          {
            fn: "utilityBill",
            name: "Utility bill",
            rule: {
              condition: Condition.NotRequired,
            },
          },
        ]}
      />
    );

    // No file requirements have been satisfied yet
    const incompleteIcons = screen.getAllByTestId("incomplete-icon");
    expect(incompleteIcons).toHaveLength(4);

    // Upload one file
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        file_type: "image/png",
        fileUrl: "https://api.editor.planx.dev/file/private/gws7l5d1/test1.jpg",
      },
    });

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, [file1]);

    // Modal opened automatically
    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog"
    );

    // The number of selects in the modal matches the number of uploaded files
    const selects = await within(document.body).findAllByTestId("select");
    expect(selects).toHaveLength(1);

    // Open the select, click the checkbox to tag this upload
    fireEvent.mouseDown(selects[0]);
    const checkboxes = await within(document.body).findAllByTestId(
      "select-checkbox"
    );
    expect(checkboxes).toHaveLength(4);
    user.click(checkboxes[0]);
    user.click(checkboxes[1]);

    // Close modal
    const submitModalButton = await within(fileTaggingModal).findByText("Done");
    expect(submitModalButton).toBeVisible();
    user.click(submitModalButton);
    await waitFor(() => expect(fileTaggingModal).not.toBeVisible());

    // Uploaded file displayed as card with chip tags
    expect(screen.getByText("test1.png")).toBeVisible();
    const chips = screen.getAllByTestId("uploaded-file-chip");
    expect(chips).toHaveLength(2);

    // Requirements list reflects successfully tagged uploads
    const completeIcons = screen.getAllByTestId("complete-icon");
    expect(completeIcons).toHaveLength(2);

    // "Continue" onto to the next node
    expect(screen.getByText("Continue")).toBeEnabled();
    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test.todo(
    "Continue is disabled when only recommended and optional file types are tagged"
  );

  test.todo("Tags are removed when the uploaded file is deleted");
});
