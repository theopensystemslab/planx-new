import { act, screen, waitFor, within } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import type { UserEvent } from "@testing-library/user-event";
import { uploadPrivateFile } from "lib/api/fileUpload/requests";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { Breadcrumbs } from "types";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { mockFileTypes, mockFileTypesUniqueKeys } from "../mocks";
import { PASSPORT_REQUESTED_FILES_KEY } from "../model";
import FileUploadAndLabelComponent from ".";

const { getState, setState } = useStore;
let initialState: FullStore;

vi.mock("lib/api/fileUpload/requests");
const mockedUploadPrivateFile = vi.mocked(uploadPrivateFile);

window.URL.createObjectURL = vi.fn();

Element.prototype.scrollIntoView = vi.fn();

beforeEach(() => {
  mockedUploadPrivateFile.mockClear();
});

describe("Basic state and setup", () => {
  test("renders correctly", async () => {
    const { getAllByRole, getByTestId, getByText } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    expect(getAllByRole("heading")[0]).toHaveTextContent("Test title");

    // Required file is listed
    expect(getByText("testKey")).toBeVisible();

    // Drop zone is available
    expect(getByTestId("upload-input")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(
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

  it("does not show a print button if hideDropZone is false", async () => {
    const { queryByText } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[mockFileTypes.AlwaysRequired, mockFileTypes.NotRequired]}
        // hideDropZone is false by default
      />,
    );
    const printButton = queryByText("Print this page");
    expect(printButton).not.toBeInTheDocument();
  });

  test("shows help buttons for header and applicable file", async () => {
    const { getAllByTestId } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={mockFileTypesUniqueKeys}
        howMeasured="This is sample help text for the whole component"
      />,
    );

    const helpButtons = getAllByTestId("more-info-button");
    expect(helpButtons).toHaveLength(1);
  });

  it("does not show optional files if there are other types", async () => {
    const { queryByRole } = await setup(
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
      queryByRole("heading", { name: /Optional information/ }),
    ).not.toBeInTheDocument();
  });

  it("shows optional files if there are no other types", async () => {
    const { getByRole } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[mockFileTypes.NotRequired]}
      />,
    );

    expect(
      getByRole("heading", { name: /Optional information/ }),
    ).toBeVisible();
  });
});

describe("Info-only mode with hidden drop zone", () => {
  test("renders correctly", async () => {
    const { getAllByRole, queryByTestId, getByText } = await setup(
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

    expect(getAllByRole("heading")[0]).toHaveTextContent("Test title");

    // Required file is listed
    expect(getByText("testKey")).toBeVisible();

    // Drop zone is not available
    expect(queryByTestId("upload-input")).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(
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

  it("shows a print button", async () => {
    const { getByText } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[mockFileTypes.AlwaysRequired, mockFileTypes.NotRequired]}
        hideDropZone={true}
      />,
    );
    expect(getByText("Print this page")).toBeVisible();
  });

  test("shows help buttons for header and applicable file", async () => {
    const { getAllByTestId } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={mockFileTypesUniqueKeys}
        hideDropZone={true}
        howMeasured="This is sample help text for the whole component"
      />,
    );

    const helpButtons = getAllByTestId("more-info-button");
    expect(helpButtons).toHaveLength(1);
  });

  it("shows optional files by default", async () => {
    const { queryByRole } = await setup(
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
      queryByRole("heading", { name: /Optional information/ }),
    ).toBeVisible();
  });
});

describe("Modal trigger", () => {
  afterEach(() => vi.clearAllMocks());

  test("Modal does not open on initial component render", async () => {
    await setup(
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
    const { getByTestId, user } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = getByTestId("upload-input");
    await user.upload(input, file);
    expect(mockedUploadPrivateFile).toHaveBeenCalled();

    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );
    expect(fileTaggingModal).toBeVisible();

    expect(
      await within(fileTaggingModal).findByTestId("test.png"),
    ).toBeVisible();
  });

  test("Modal opens when multiple files are uploaded", async () => {
    const { getByTestId, user } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const file2 = new File(["test2"], "test2.png", { type: "image/png" });
    const input = getByTestId("upload-input");
    await user.upload(input, [file1, file2]);
    expect(mockedUploadPrivateFile).toHaveBeenCalledTimes(2);

    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );
    expect(
      await within(fileTaggingModal).findByTestId("test1.png"),
    ).toBeVisible();
    expect(
      await within(fileTaggingModal).findByTestId("test2.png"),
    ).toBeVisible();
  });

  test("Modal does not open when a file is deleted", async () => {
    const { getByTestId, queryByText, user } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const file2 = new File(["test2"], "test2.png", { type: "image/png" });
    const input = getByTestId("upload-input");
    await user.upload(input, [file1, file2]);

    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );

    // Close modal
    await user.keyboard("{Esc}");
    await waitFor(() => expect(fileTaggingModal).not.toBeVisible());

    // Uploaded files displayed as cards
    expect(getByTestId("test1.png")).toBeVisible();
    expect(getByTestId("test2.png")).toBeVisible();

    // Delete the second file
    user.click(getByTestId("delete-test2.png"));

    // Card removed from screen
    await waitFor(() =>
      expect(queryByText("test2.png")).not.toBeInTheDocument(),
    );

    // Modal not open
    expect(fileTaggingModal).not.toBeVisible();
  });
});

describe("Adding tags and syncing state", () => {
  test("Can continue when all required file types are uploaded and tagged", async () => {
    const handleSubmit = vi.fn();
    const {
      getAllByRole,
      getAllByTestId,
      getByRole,
      getByTestId,
      getByText,
      user,
    } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    // No file requirements have been satisfied yet
    let incompleteIcons = getAllByTestId("incomplete-icon");
    expect(incompleteIcons).toHaveLength(2);

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const input = getByTestId("upload-input");
    await user.upload(input, [file1]);

    // Modal opened automatically
    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );

    // The number of file cards in the modal matches the number of uploaded files
    const uploadedFileCards = getAllByRole("heading", {
      name: /What does this file show/,
    });
    expect(uploadedFileCards).toHaveLength(1);

    const submitModalButton = getByRole("button", { name: /Done/ });
    expect(submitModalButton).toBeVisible();

    // Find the "Roof plan" checkbox using label text
    const roofPlanCheckbox =
      within(fileTaggingModal).getByLabelText("Roof plan");

    // Apply tag to this file
    await user.click(roofPlanCheckbox);

    // Close modal
    await user.click(submitModalButton);
    expect(fileTaggingModal).not.toBeVisible();

    // Uploaded file displayed as card with chip tags
    expect(getByTestId("test1.png")).toBeVisible();
    const chips = getAllByTestId("uploaded-file-chip");
    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveTextContent("Roof plan");

    // Requirements list reflects successfully tagged uploads
    const completeIcons = getAllByTestId("complete-icon");
    expect(completeIcons).toHaveLength(1);
    incompleteIcons = getAllByTestId("incomplete-icon");
    expect(incompleteIcons).toHaveLength(1);

    // "Continue" onto to the next node
    expect(getByText("Continue")).toBeEnabled();
    await user.click(getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test("Cannot continue when only an optional file type is uploaded and tagged", async () => {
    const handleSubmit = vi.fn();
    const { getAllByRole, getAllByTestId, getByTestId, getByText, user } =
      await setup(
        <FileUploadAndLabelComponent
          title="Test title"
          handleSubmit={handleSubmit}
          fileTypes={mockFileTypesUniqueKeys}
        />,
      );

    // No file requirements have been satisfied yet
    let incompleteIcons = getAllByTestId("incomplete-icon");
    expect(incompleteIcons).toHaveLength(2);

    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const input = getByTestId("upload-input");
    await user.upload(input, [file1]);

    // Modal opened automatically
    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );

    // The number of file cards in the modal matches the number of uploaded files
    const uploadedFileCards = getAllByRole("heading", {
      name: /What does this file show/,
    });
    expect(uploadedFileCards).toHaveLength(1);

    // Find the "Heritage statement" checkbox using label text
    const heritageStatementCheckbox =
      within(fileTaggingModal).getByLabelText("Heritage statement");

    // Apply tag to this file
    await user.click(heritageStatementCheckbox);

    // Close modal
    await user.keyboard("{Esc}");
    await waitFor(() => expect(fileTaggingModal).not.toBeVisible());

    // Uploaded file displayed as card with chip tags
    expect(getByTestId("test1.png")).toBeVisible();
    const chips = getAllByTestId("uploaded-file-chip");
    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveTextContent("Heritage statement");

    // Requirements list reflects successfully tagged uploads
    const completeIcons = getAllByTestId("complete-icon");
    expect(completeIcons).toHaveLength(1);
    incompleteIcons = getAllByTestId("incomplete-icon");
    expect(incompleteIcons).toHaveLength(1);

    // Show error when attempting to "Continue" onto to the next node
    expect(getByText("Continue")).toBeEnabled();
    await user.click(getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalledTimes(0);
    const error = await within(document.body).findByText(
      /Please upload and label all required information/,
    );
    expect(error).toBeVisible();
  });
});

describe("Error handling", () => {
  test("An error is thrown if a user does not upload any files", async () => {
    const handleSubmit = vi.fn();

    const { getByTestId, getByRole, findByText, user } = await setup(
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

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = getByTestId("upload-input");

    // User cannot submit without uploading a file
    await user.click(getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();

    // Error warns user of this
    const dropzoneError = await findByText(/Upload at least one file/);
    expect(dropzoneError).toBeVisible();

    await user.upload(input, file);
    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );
    expect(fileTaggingModal).toBeVisible();
    await user.keyboard("{Esc}");

    // Error message is cleared
    expect(dropzoneError).toBeEmptyDOMElement();

    const deleteButton = getByRole("button", { name: /Delete/ });
    await user.click(deleteButton);

    // Error message does not immediately re-appear
    expect(dropzoneError).toBeEmptyDOMElement();

    // Error appears again after user attempt to submit without files
    await user.click(getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(dropzoneError).toBeVisible();
  });

  test("An error is thrown in the modal if a user does not tag all files", async () => {
    const { getByTestId, user } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        fileTypes={[
          mockFileTypes.AlwaysRequired,
          mockFileTypes.AlwaysRecommended,
          mockFileTypes.NotRequired,
        ]}
      />,
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpg" });
    const input = getByTestId("upload-input");
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
      /File test.jpg is not labeled/,
    );
    expect(modalError).toBeVisible();
  });

  test("An error is thrown in the main component if a user does not tag all files", async () => {
    const handleSubmit = vi.fn();

    const { getByTestId, getByRole, getAllByRole, findByText, user } =
      await setup(
        <FileUploadAndLabelComponent
          handleSubmit={handleSubmit}
          title="Test title"
          fileTypes={mockFileTypesUniqueKeys}
        />,
      );

    const file = new File(["test"], "test.jpg", { type: "image/jpg" });
    const input = getByTestId("upload-input");
    await user.upload(input, file);

    // Exit modal without tagging
    await user.keyboard("{Esc}");

    // User cannot submit without uploading a file
    await user.click(getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
    const fileListError = await findByText(/File test.jpg is not labeled/);
    expect(fileListError).toBeVisible();

    // Re-open modal and tag file
    await user.click(getByRole("button", { name: /Change/ }));
    const uploadedFileCards = getAllByRole("heading", {
      name: /What does this file show/,
    });
    expect(uploadedFileCards).toHaveLength(1);

    // Find the "Utility bill" checkbox using label text
    const fileTaggingModal = await within(document.body).findByTestId(
      "file-tagging-dialog",
    );
    const utilityBillCheckbox =
      within(fileTaggingModal).getByLabelText("Utility bill");

    // Apply tag to this file
    await user.click(utilityBillCheckbox);

    await user.click(getByRole("button", { name: /Done/ }));

    // Error message is cleared, user can submit
    expect(fileListError).toBeEmptyDOMElement();
    await user.click(getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

describe("Submitting data", () => {
  beforeAll(() => (initialState = getState()));

  afterEach(() => waitFor(() => setState(initialState)));

  it("records the user uploaded files", async () => {
    const handleSubmit = vi.fn();
    const { getByText, user } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    await uploadAndTagSingleFile(user);

    await user.click(getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    const submitted = handleSubmit.mock.calls[0][0];
    const uploadedFile = submitted?.data?.roofPlan;

    expect(uploadedFile).toBeDefined();
    expect(uploadedFile).toHaveLength(1);
    expect(uploadedFile[0]).toEqual(
      expect.objectContaining({
        filename: "test1.png",
        url: "https://api.editor.planx.dev/file/private/mock-nanoid/test1.png",
      }),
    );
  });

  it("records the full file type list presented to the user", async () => {
    const handleSubmit = vi.fn();
    const { getByText, user } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    await uploadAndTagSingleFile(user);
    await user.click(getByText("Continue"));

    const submitted = handleSubmit.mock.calls[0][0];
    const requestedFiles = submitted?.data?._requestedFiles;

    expect(requestedFiles).toBeDefined();
    expect(requestedFiles.required).toContain("roofPlan");
    expect(requestedFiles.recommended).toContain("heritage");
    expect(requestedFiles.optional).toContain("utilityBill");
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
          [PASSPORT_REQUESTED_FILES_KEY]: {
            required: ["anotherFileType"],
            recommended: [],
            optional: [],
          },
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

    const handleSubmit = vi.fn();
    const { getByText, user } = await setup(
      <FileUploadAndLabelComponent
        title="Test title"
        handleSubmit={handleSubmit}
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    await uploadAndTagSingleFile(user);
    await user.click(getByText("Continue"));

    const submitted = handleSubmit.mock.calls[0][0];
    const requestedFiles = submitted?.data?._requestedFiles;

    // Existing files from previous components
    expect(requestedFiles.required).toContain("anotherFileType");

    // Requested files from this component
    expect(requestedFiles.required).toContain("roofPlan");
    expect(requestedFiles.recommended).toContain("heritage");
    expect(requestedFiles.optional).toContain("utilityBill");
  });
});

/**
 * Test helper which steps through the process of uploading and labelling a file
 * Does not contain assertations - relies on these happening in other, more granular, passing tests
 */
const uploadAndTagSingleFile = async (user: UserEvent) => {
  const file1 = new File(["test1"], "test1.png", { type: "image/png" });
  const input = screen.getByTestId("upload-input");
  await user.upload(input, [file1]);

  const fileTaggingModal = await within(document.body).findByTestId(
    "file-tagging-dialog",
  );

  // Find the "Roof plan" checkbox using label text
  const roofPlanCheckbox = within(fileTaggingModal).getByLabelText("Roof plan");
  await user.click(roofPlanCheckbox);

  // Close modal
  const submitModalButton = await within(fileTaggingModal).findByText("Done");
  user.click(submitModalButton);

  // Wait for upload to complete
  const progressBar = screen.getByRole("progressbar");
  await waitFor(() => {
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });
};
