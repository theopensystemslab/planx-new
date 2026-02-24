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

describe("Accordion trigger", () => {
  afterEach(() => vi.clearAllMocks());

  test("No file card is expanded on initial component render", async () => {
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

    // No checklist headings visible (accordion content is hidden)
    expect(
      screen.queryByRole("heading", { name: /What does this file show/ }),
    ).not.toBeInTheDocument();
  });

  test("Accordion expands when a single file is uploaded", async () => {
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

    // File card is visible
    expect(await screen.findByTestId("test.png")).toBeVisible();

    // Accordion content is expanded showing the checklist
    expect(
      await screen.findByRole("heading", { name: /What does this file show/ }),
    ).toBeVisible();
  });

  test("Accordion expands when multiple files are uploaded", async () => {
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

    // Both file cards are visible
    expect(await screen.findByTestId("test1.png")).toBeVisible();
    expect(await screen.findByTestId("test2.png")).toBeVisible();

    // Only one accordion is expanded at a time
    const checklistHeadings = screen.getAllByRole("heading", {
      name: /What does this file show/,
    });
    expect(checklistHeadings).toHaveLength(1);
  });

  test("Accordion does not expand when a file is deleted", async () => {
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

    // Save the first file's accordion (close it)
    const saveButton = await screen.findByRole("button", { name: /Save/ });
    await user.click(saveButton);

    // Both uploaded files displayed as cards
    expect(getByTestId("test1.png")).toBeVisible();
    expect(getByTestId("test2.png")).toBeVisible();

    // Delete the second file
    const removeButtons = screen.getAllByRole("button", { name: /Remove/ });
    await user.click(removeButtons[removeButtons.length - 1]);

    // Card removed from screen
    await waitFor(() =>
      expect(queryByText("test2.png")).not.toBeInTheDocument(),
    );

    // No accordion is expanded
    expect(
      screen.queryByRole("heading", { name: /What does this file show/ }),
    ).not.toBeInTheDocument();
  });
});

describe("Adding tags and syncing state", () => {
  test("Can continue when all required file types are uploaded and tagged", async () => {
    const handleSubmit = vi.fn();
    const { getAllByTestId, getByTestId, getByText, user } = await setup(
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

    // Accordion auto-expanded for the uploaded file
    expect(
      await screen.findByRole("heading", { name: /What does this file show/ }),
    ).toBeVisible();

    // Find the "Roof plan" checkbox
    const roofPlanCheckbox = screen.getByLabelText("Roof plan");

    // Apply tag to this file
    await user.click(roofPlanCheckbox);

    // Save and close the accordion
    const saveButton = screen.getByRole("button", { name: /Save/ });
    await user.click(saveButton);

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
    const { getAllByTestId, getByTestId, getByText, user } = await setup(
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

    // Accordion auto-expanded
    expect(
      await screen.findByRole("heading", { name: /What does this file show/ }),
    ).toBeVisible();

    // Find the "Heritage statement" checkbox
    const heritageStatementCheckbox =
      screen.getByLabelText("Heritage statement");

    // Apply tag to this file
    await user.click(heritageStatementCheckbox);

    // Save and close the accordion
    const saveButton = screen.getByRole("button", { name: /Save/ });
    await user.click(saveButton);

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

    const { getByTestId, findByText, user } = await setup(
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

    // File uploaded and accordion expanded
    expect(await screen.findByTestId("test.png")).toBeVisible();

    // Error message is cleared
    expect(dropzoneError).toBeEmptyDOMElement();

    // Remove the file
    const removeButton = screen.getByRole("button", {
      name: /Remove test.png/,
    });
    await user.click(removeButton);

    // Error message does not immediately re-appear
    await waitFor(() =>
      expect(screen.queryByTestId("test.png")).not.toBeInTheDocument(),
    );
    expect(dropzoneError).toBeEmptyDOMElement();

    // Error appears again after user attempt to submit without files
    await user.click(getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(dropzoneError).toBeVisible();
  });

  test("An error is thrown if a user does not tag all files", async () => {
    const handleSubmit = vi.fn();

    const { getByTestId, findByText, user } = await setup(
      <FileUploadAndLabelComponent
        handleSubmit={handleSubmit}
        title="Test title"
        fileTypes={mockFileTypesUniqueKeys}
      />,
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpg" });
    const input = getByTestId("upload-input");
    await user.upload(input, file);

    // Accordion is expanded — save without tagging
    const saveButton = await screen.findByRole("button", { name: /Save/ });
    await user.click(saveButton);

    // User cannot submit without tagging files
    await user.click(getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
    const fileLabelError = await findByText(/File test.jpg is not labeled/);
    expect(fileLabelError).toBeVisible();

    // Edit the file and tag it
    const editButton = screen.getByRole("button", { name: /Edit/ });
    await user.click(editButton);

    const utilityBillCheckbox = screen.getByLabelText("Utility bill");
    await user.click(utilityBillCheckbox);

    const saveButtonAgain = screen.getByRole("button", { name: /Save/ });
    await user.click(saveButtonAgain);

    // Error message is cleared
    expect(fileLabelError).toBeEmptyDOMElement();
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

  // Accordion auto-expanded — find the "Roof plan" checkbox
  const roofPlanCheckbox = await screen.findByLabelText("Roof plan");
  await user.click(roofPlanCheckbox);

  // Save (close accordion)
  const saveButton = screen.getByRole("button", { name: /Save/ });
  await user.click(saveButton);

  // Wait for upload to complete
  const progressBar = screen.getByRole("progressbar");
  await waitFor(() => {
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });
};
