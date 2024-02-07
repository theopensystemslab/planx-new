import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import axios from "axios";
import { vanillaStore } from "pages/FlowEditor/lib/store";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { axe, setup } from "testUtils";
import { Breadcrumbs } from "types";

import { mockFileTypes, mockFileTypesUniqueKeys } from "./mocks";
import { Condition, PASSPORT_REQUESTED_FILES_KEY } from "./model";
import FileUploadAndLabelComponent from "./Public";

const { getState, setState } = vanillaStore;
let initialState: FullStore;

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

window.URL.createObjectURL = jest.fn();

describe("Basic state and setup", () => {
  test("renders correctly", async () => {
    setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    expect(screen.getAllByRole("heading")[0]).toHaveTextContent("Test title");

    // Required file is listed
    expect(screen.getByText("testKey")).toBeVisible();

    // Drop zone is available
    expect(screen.getByTestId("upload-input")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("shows help buttons for header and applicable file", async () => {
    setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={mockFileTypesUniqueKeys}
        howMeasured="This is sample help text for the whole component"
      />,
    );

    const helpButtons = screen.getAllByTestId("more-info-button");
    expect(helpButtons).toHaveLength(1);
  });

  it("does not show optional files if there are other types", () => {
    setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: /Optional files/ }),
    ).toBeNull();
  });

  it("shows optional files if there are no other types", () => {
    setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[mockFileTypes.NotRequired]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /Optional files/ }),
    ).toBeVisible();
  });
});

describe("Info-only mode with hidden drop zone", () => {
  test("renders correctly", async () => {
    setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
        hideDropZone={true}
      />,
    );

    expect(screen.getAllByRole("heading")[0]).toHaveTextContent("Test title");

    // Required file is listed
    expect(screen.getByText("testKey")).toBeVisible();

    // Drop zone is not available
    expect(screen.queryByTestId("upload-input")).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
        hideDropZone={true}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("shows help buttons for header and applicable file", async () => {
    setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={mockFileTypesUniqueKeys}
        hideDropZone={true}
        howMeasured="This is sample help text for the whole component"
      />,
    );

    const helpButtons = screen.getAllByTestId("more-info-button");
    expect(helpButtons).toHaveLength(1);
  });

  it("shows optional files by default", () => {
    setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
        hideDropZone={true}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: /Optional files/ }),
    ).toBeVisible();
  });
});

describe("Modal trigger", () => {
  afterEach(() => jest.clearAllMocks());

  test("Modal does not open on initial component render", async () => {
    setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    const fileTaggingModal = within(document.body).queryByTestId(
      "file-tagging-dialog",
    );

    expect(fileTaggingModal).not.toBeInTheDocument();
  });

  test("Modal opens when a single file is uploaded", async () => {
    const { user } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );
    const mockedPost = mockedAxios.post.mockResolvedValue({
      data: {
        fileType: "image/png",
        fileUrl: "https://api.editor.planx.dev/file/private/gws7l5d1/test.jpg",
      },
    });

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, file);
    expect(mockedPost).toHaveBeenCalled();

    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );
    expect(fileTaggingModal).toBeVisible();

    expect(await within(fileTaggingModal).findByText("test.png")).toBeVisible();
  });

  test("Modal opens when multiple files are uploaded", async () => {
    const { user } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    const mockedPost = mockedAxios.post
      .mockResolvedValueOnce({
        data: {
          fileType: "image/png",
          fileUrl:
            "https://api.editor.planx.dev/file/private/gws7l5d1/test1.jpg",
        },
      })
      .mockResolvedValueOnce({
        data: {
          fileType: "image/png",
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
      "file-tagging-dialog",
    );
    expect(
      await within(fileTaggingModal).findByText("test1.png"),
    ).toBeVisible();
    expect(
      await within(fileTaggingModal).findByText("test2.png"),
    ).toBeVisible();
  });

  test("Modal does not open when a file is deleted", async () => {
    const { user } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    // Upload two files
    mockedAxios.post
      .mockResolvedValueOnce({
        data: {
          fileType: "image/png",
          fileUrl:
            "https://api.editor.planx.dev/file/private/gws7l5d1/test1.jpg",
        },
      })
      .mockResolvedValueOnce({
        data: {
          fileType: "image/png",
          fileUrl:
            "https://api.editor.planx.dev/file/private/gws7l5d1/test2.jpg",
        },
      });

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const file2 = new File(["test2"], "test2.png", { type: "image/png" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, [file1, file2]);

    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );

    // Close modal
    await user.keyboard("{Esc}");
    await waitFor(() => expect(fileTaggingModal).not.toBeVisible());

    // Uploaded files displayed as cards
    expect(screen.getByText("test1.png")).toBeVisible();
    expect(screen.getByText("test2.png")).toBeVisible();

    // Delete the second file
    user.click(screen.getByLabelText("Delete test2.png"));

    // Card removed from screen
    await waitFor(() =>
      expect(screen.queryByText("test2.png")).not.toBeInTheDocument(),
    );

    // Modal not open
    expect(fileTaggingModal).not.toBeVisible();
  });
});

describe("Adding tags and syncing state", () => {
  test("Can continue when all required file types are uploaded and tagged", async () => {
    const handleSubmit = jest.fn();
    const { user } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    // No file requirements have been satisfied yet
    let incompleteIcons = screen.getAllByTestId("incomplete-icon");
    expect(incompleteIcons).toHaveLength(2);

    // Upload one file
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        fileType: "image/png",
        fileUrl: "https://api.editor.planx.dev/file/private/gws7l5d1/test1.jpg",
      },
    });

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, [file1]);

    // Modal opened automatically
    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );

    // The number of selects in the modal matches the number of uploaded files
    const selects = await within(document.body).findAllByTestId("select");
    expect(selects).toHaveLength(1);

    const submitModalButton = await within(fileTaggingModal).findByText("Done");
    expect(submitModalButton).toBeVisible();

    // Apply multiple tags to this file
    fireEvent.change(selects[0], { target: { value: "Roof plan" } });

    // Close modal successfully
    user.click(submitModalButton);
    await waitFor(() => expect(fileTaggingModal).not.toBeVisible());

    // Uploaded file displayed as card with chip tags
    expect(screen.getByText("test1.png")).toBeVisible();
    const chips = screen.getAllByTestId("uploaded-file-chip");
    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveTextContent("Roof plan");

    // Requirements list reflects successfully tagged uploads
    const completeIcons = screen.getAllByTestId("complete-icon");
    expect(completeIcons).toHaveLength(1);
    incompleteIcons = screen.getAllByTestId("incomplete-icon");
    expect(incompleteIcons).toHaveLength(1);

    // "Continue" onto to the next node
    expect(screen.getByText("Continue")).toBeEnabled();
    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test("Cannot continue when only an optional file type is uploaded and tagged", async () => {
    const handleSubmit = jest.fn();
    const { user } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    // No file requirements have been satisfied yet
    let incompleteIcons = screen.getAllByTestId("incomplete-icon");
    expect(incompleteIcons).toHaveLength(2);

    // Upload one file
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        fileType: "image/png",
        fileUrl: "https://api.editor.planx.dev/file/private/gws7l5d1/test1.jpg",
      },
    });

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, [file1]);

    // Modal opened automatically
    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );

    // The number of selects in the modal matches the number of uploaded files
    const selects = await within(document.body).findAllByTestId("select");
    expect(selects).toHaveLength(1);

    // Apply multiple tags to this file
    fireEvent.change(selects[0], { target: { value: "Heritage statement" } });

    // Close modal
    await user.keyboard("{Esc}");
    await waitFor(() => expect(fileTaggingModal).not.toBeVisible());

    // Uploaded file displayed as card with chip tags
    expect(screen.getByText("test1.png")).toBeVisible();
    const chips = screen.getAllByTestId("uploaded-file-chip");
    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveTextContent("Heritage statement");

    // Requirements list reflects successfully tagged uploads
    const completeIcons = screen.getAllByTestId("complete-icon");
    expect(completeIcons).toHaveLength(1);
    incompleteIcons = screen.getAllByTestId("incomplete-icon");
    expect(incompleteIcons).toHaveLength(1);

    // Show error when attempting to "Continue" onto to the next node
    expect(screen.getByText("Continue")).toBeEnabled();
    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalledTimes(0);
    const error = await within(document.body).findByText(
      "Please upload and label all required files",
    );
    expect(error).toBeVisible();
  });
});

describe("Error handling", () => {
  test("An error is thrown if a user does not upload any files", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <FileUploadAndLabelComponent
        handleSubmit={handleSubmit}
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        fileType: "image/png",
        fileUrl: "https://api.editor.planx.dev/file/private/gws7l5d1/test.png",
      },
    });

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = screen.getByTestId("upload-input");

    // User cannot submit without uploading a file
    await user.click(screen.getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();

    // Error warns user of this
    const dropzoneError = await screen.findByText("Upload at least one file");
    expect(dropzoneError).toBeVisible();

    await user.upload(input, file);
    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );
    expect(fileTaggingModal).toBeVisible();
    await user.keyboard("{Esc}");

    // Error message is cleared
    expect(dropzoneError).toBeEmptyDOMElement();

    const deleteButton = screen.getByRole("button", { name: /Delete/ });
    await user.click(deleteButton);

    // Error message does not immediately re-appear
    expect(dropzoneError).toBeEmptyDOMElement();

    // Error appears again after user attempt to submit without files
    await user.click(screen.getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(dropzoneError).toBeVisible();
  });

  test("An error is thrown in the modal if a user does not tag all files", async () => {
    const { user } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    mockedAxios.post.mockResolvedValue({
      data: {
        fileType: "image/png",
        fileUrl: "https://api.editor.planx.dev/file/private/gws7l5d1/test.jpg",
      },
    });

    const file = new File(["test"], "test.jpg", { type: "image/jpg" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, file);

    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );
    expect(fileTaggingModal).toBeVisible();
    const submitModalButton = await within(fileTaggingModal).findByText("Done");

    // Attempt to close without tagging files
    await user.click(submitModalButton);
    expect(true).toBeTruthy();
    const modalError = await within(fileTaggingModal).findByText(
      "Please label all files",
    );
    expect(modalError).toBeVisible();
  });

  test("An error is thrown in the main component if a user does not tag all files", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <FileUploadAndLabelComponent
        handleSubmit={handleSubmit}
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    mockedAxios.post.mockResolvedValue({
      data: {
        fileType: "image/png",
        fileUrl: "https://api.editor.planx.dev/file/private/gws7l5d1/test.jpg",
      },
    });

    const file = new File(["test"], "test.jpg", { type: "image/jpg" });
    const input = screen.getByTestId("upload-input");
    await user.upload(input, file);

    // Exit modal without tagging
    await user.keyboard("{Esc}");

    // User cannot submit without uploading a file
    await user.click(screen.getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
    const fileListError = await screen.findByText("Please label all files");
    expect(fileListError).toBeVisible();

    // Re-open modal and tag file
    await user.click(screen.getByRole("button", { name: /Change/ }));
    const select = within(document.body).getByTestId("select");
    fireEvent.change(select, { target: { value: "Utility bill" } });
    await user.click(screen.getByRole("button", { name: /Done/ }));

    // Error message is cleared, user can submit
    expect(fileListError).toBeEmptyDOMElement();
    await user.click(screen.getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

describe("Submitting data", () => {
  beforeAll(() => (initialState = getState()));

  afterEach(() => waitFor(() => setState(initialState)));

  it("records the user uploaded files", async () => {
    const handleSubmit = jest.fn();
    const { user } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    await uploadAndTagSingleFile(user);

    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    const submitted = handleSubmit.mock.calls[0][0];
    const uploadedFile = submitted?.data?.roofPlan;

    expect(uploadedFile).toBeDefined();
    expect(uploadedFile).toHaveLength(1);
    expect(uploadedFile[0]).toEqual(
      expect.objectContaining({
        filename: "test1.png",
        url: "https://api.editor.planx.dev/file/private/gws7l5d1/test1.jpg",
      }),
    );
  });

  it("records the full file type list presented to the user", async () => {
    const handleSubmit = jest.fn();
    const { user } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    await uploadAndTagSingleFile(user);
    await user.click(screen.getByText("Continue"));

    const submitted = handleSubmit.mock.calls[0][0];
    const requestedFiles = submitted?.data?._requestedFiles;

    expect(requestedFiles).toBeDefined();
    expect(requestedFiles).toHaveLength(3);
    expect(requestedFiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fn: "roofPlan",
          condition: Condition.AlwaysRequired,
        }),
        expect.objectContaining({
          fn: "heritage",
          condition: Condition.AlwaysRecommended,
        }),
        expect.objectContaining({
          fn: "utilityBill",
          condition: Condition.NotRequired,
        }),
      ]),
    );
  });

  it("appends to the list of existing requested files", async () => {
    // Mimic having passed file upload / file upload and label component
    const breadcrumbs: Breadcrumbs = {
      previousFileUploadComponent: {
        auto: false,
        data: {
          anotherFileType: [
            {
              url: "http://test.com/file.jpg",
              filename: "file.jpg",
            },
          ],
          [PASSPORT_REQUESTED_FILES_KEY]: [
            {
              fn: "anotherFileType",
              condition: Condition.AlwaysRequired,
            },
          ],
        },
      },
    };

    const flow = {
      _root: {
        edges: ["previousFileUploadComponent", "currentComponent"],
      },
      previousFileUploadComponent: {
        data: {
          fn: "anotherFileType",
          color: "#EFEFEF",
        },
        type: 140,
      },
      currentComponent: {
        type: 145,
        data: {
          title: "Upload and label",
          fileTypes: [
            {
              name: "Floor Plan",
              fn: "floorPlan",
              rule: {
                condition: "AlwaysRequired",
              },
            },
          ],
          hideDropZone: false,
        },
      },
    };

    act(() => setState({ flow, breadcrumbs }));

    const passport = useStore.getState().computePassport();
    console.log({ passport });

    const handleSubmit = jest.fn();
    const { user } = setup(
      <FileUploadAndLabelComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    await uploadAndTagSingleFile(user);
    await user.click(screen.getByText("Continue"));

    const submitted = handleSubmit.mock.calls[0][0];
    const requestedFiles = submitted?.data?._requestedFiles;

    expect(requestedFiles).toEqual(
      expect.arrayContaining([
        // Existing files from previous components
        expect.objectContaining({
          fn: "anotherFileType",
          condition: Condition.AlwaysRequired,
        }),
        // Requested files from this component
        expect.objectContaining({
          fn: "roofPlan",
          condition: Condition.AlwaysRequired,
        }),
        expect.objectContaining({
          fn: "heritage",
          condition: Condition.AlwaysRecommended,
        }),
        expect.objectContaining({
          fn: "utilityBill",
          condition: Condition.NotRequired,
        }),
      ]),
    );
  });
});

/**
 * Test helper which steps through the process of uploading and labelling a file
 * Does not contain assertations - relies on these happening in other, more granular, passing tests
 */
const uploadAndTagSingleFile = async (user: UserEvent) => {
  mockedAxios.post.mockResolvedValueOnce({
    data: {
      fileType: "image/png",
      fileUrl: "https://api.editor.planx.dev/file/private/gws7l5d1/test1.jpg",
    },
  });

  const file1 = new File(["test1"], "test1.png", { type: "image/png" });
  const input = screen.getByTestId("upload-input");
  await user.upload(input, [file1]);

  const fileTaggingModal = await within(document.body).findByTestId(
    "file-tagging-dialog",
  );

  const selects = await within(document.body).findAllByTestId("select");
  fireEvent.change(selects[0], { target: { value: "Roof plan" } });

  const submitModalButton = await within(fileTaggingModal).findByText("Done");
  user.click(submitModalButton);
};
