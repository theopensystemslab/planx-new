import { Breadcrumbs } from "@opensystemslab/planx-core/types";
import { PASSPORT_REQUESTED_FILES_KEY } from "@planx/components/FileUploadAndLabel/model";
import { act, screen, waitFor } from "@testing-library/react";
import { uploadPrivateFile } from "lib/api/fileUpload/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import {
  DrawBoundaryUserAction,
  PASSPORT_COMPONENT_ACTION_KEY,
  PASSPORT_UPLOAD_KEY,
} from "../model";
import DrawBoundary from ".";

vi.mock("lib/api/fileUpload/requests");
const mockedUploadPrivateFile = vi.mocked(uploadPrivateFile);

global.URL.createObjectURL = vi.fn();

const { getState, setState } = useStore;

beforeEach(() => {
  mockedUploadPrivateFile.mockClear();
});

test("recovers previously submitted files when clicking the back button", async () => {
  const handleSubmit = vi.fn();
  const previouslySubmittedData = {
    locationPlan: [
      {
        file: {
          path: "placeholder.png",
          size: 6146,
        },
        status: "success",
        progress: 1,
        id: "43sDL_JNJ6JgYxd_WUYW-",
        url: "http://localhost:7002/file/private/slb56xfv/placeholder.png",
      },
    ],
  };

  const { user } = await setup(
    <DrawBoundary
      fn="proposal.site"
      description=""
      descriptionForUploading=""
      title="Draw a boundary"
      titleForUploading="Upload a file"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: previouslySubmittedData,
      }}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: expect.objectContaining(previouslySubmittedData),
  });
});

test("recovers previously submitted drawing when clicking the back button", async () => {
  const handleSubmit = vi.fn();
  const previouslySubmittedData = {
    "proposal.site": {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-0.07643975531307334, 51.485847769536015],
            [-0.0764006164494183, 51.4855918619739],
            [-0.07587615567891393, 51.48561867140494],
            [-0.0759899845402056, 51.48584045791162],
            [-0.07643975531307334, 51.485847769536015],
          ],
        ],
      },
    },
  };

  const { user } = await setup(
    <DrawBoundary
      fn="proposal.site"
      description=""
      descriptionForUploading=""
      title="Draw a boundary"
      titleForUploading="Upload a file"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: previouslySubmittedData,
      }}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: expect.objectContaining(previouslySubmittedData),
  });
});

it("should not have any accessibility violations", async () => {
  const { container } = await setup(
    <DrawBoundary
      fn="proposal.site"
      description="description1"
      descriptionForUploading="description1"
      title="Draw a boundary"
      titleForUploading="Upload a file"
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("shows the file upload option by default and requires user data to continue from either page", async () => {
  const handleSubmit = vi.fn();

  const { user } = await setup(
    <DrawBoundary
      fn="proposal.site"
      description=""
      descriptionForUploading=""
      title="Draw a boundary"
      titleForUploading="Upload a file"
      handleSubmit={handleSubmit}
    />,
  );

  // Draw a boundary screen
  expect(screen.getByTestId("upload-file-button")).toBeInTheDocument();
  expect(screen.getByTestId("continue-button")).toBeEnabled();

  await user.click(screen.getByTestId("continue-button"));
  expect(
    screen.getByTestId("error-message-draw-boundary-map"),
  ).toBeInTheDocument();

  // Navigate to upload a file screen
  await user.click(screen.getByTestId("upload-file-button"));
  expect(screen.getByText("Upload a file")).toBeInTheDocument();

  // Continue is enabled by default, but requires data to proceed
  expect(screen.getByTestId("continue-button")).toBeEnabled();
  await user.click(screen.getByTestId("continue-button"));
  expect(
    screen.getByTestId("error-message-upload-location-plan"),
  ).toBeInTheDocument();
});

test("hides the upload option and allows user to continue without drawing if editor specifies", async () => {
  const handleSubmit = vi.fn();

  const { user } = await setup(
    <DrawBoundary
      fn="proposal.site"
      description=""
      descriptionForUploading=""
      title="Draw a boundary"
      titleForUploading="Upload a file"
      handleSubmit={handleSubmit}
      hideFileUpload={true}
    />,
  );

  expect(screen.queryByTestId("upload-file-button")).not.toBeInTheDocument();

  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

test("captures output data in the correct format when uploading a file", async () => {
  const file = new File(["test"], "test.png", { type: "image/png" });

  const handleSubmit = vi.fn();

  const { user } = await setup(
    <DrawBoundary
      fn="proposal.site"
      description=""
      descriptionForUploading=""
      title="Draw a boundary"
      titleForUploading="Upload a file"
      handleSubmit={handleSubmit}
    />,
  );

  // Toggle to file upload mode
  await user.click(screen.getByTestId("upload-file-button"));

  // Upload file
  const input = screen.getByTestId("upload-input");
  await user.upload(input, file);
  expect(mockedUploadPrivateFile).toHaveBeenCalled();

  // Wait for upload to complete
  const progressBar = screen.getByRole("progressbar");
  await waitFor(() => {
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });

  await user.click(screen.getByTestId("continue-button"));
  const submitted = handleSubmit.mock.calls[0][0];

  // DrawBoundary passport variable set
  expect(submitted.data).toHaveProperty(PASSPORT_UPLOAD_KEY);
  expect(submitted.data.locationPlan).toHaveLength(1);
  expect(submitted.data.locationPlan[0].url).toEqual(
    "https://api.editor.planx.dev/file/private/mock-nanoid/test.png",
  );
  expect(submitted.data.locationPlan[0].file.name).toEqual("test.png");

  // DrawBoundary action captured
  expect(submitted.data[PASSPORT_COMPONENT_ACTION_KEY]).toEqual(
    DrawBoundaryUserAction.Upload,
  );

  // File added to requested files
  expect(submitted.data).toHaveProperty(PASSPORT_REQUESTED_FILES_KEY);
  expect(submitted.data[PASSPORT_REQUESTED_FILES_KEY]).toMatchObject(
    expect.objectContaining({
      required: [PASSPORT_UPLOAD_KEY],
      recommended: [],
      optional: [],
    }),
  );
});

test("appends to existing '_requestedFiles' value", async () => {
  const file = new File(["test"], "test.png", { type: "image/png" });

  const handleSubmit = vi.fn();

  // Mimic having passed file upload / file upload and label component
  const breadcrumbs: Breadcrumbs = {
    previousFileUploadComponent: {
      auto: false,
      data: {
        floorPlan: [
          {
            url: "http://test.com/file1.jpg",
            filename: "file1.jpg",
          },
        ],
        utilityBill: [
          {
            url: "http://test.com/file2.jpg",
            filename: "file2.jpg",
          },
        ],
        "elevations.existing": [
          {
            url: "http://test.com/file3.jpg",
            filename: "file3.jpg",
          },
        ],
        [PASSPORT_REQUESTED_FILES_KEY]: {
          required: ["floorPlan", "utilityBill"],
          recommended: ["elevations.existing"],
          optional: [],
        },
      },
    },
  };

  const flow = {
    _root: {
      edges: ["previousFileUploadComponent", "DrawBoundary"],
    },
    previousFileUploadComponent: {
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
          {
            name: "Utility Bill",
            fn: "utilityBill",
            rule: {
              condition: "AlwaysRequired",
            },
          },
          {
            name: "Existing elevations",
            fn: "elevations.existing",
            rule: {
              condition: "AlwaysRecommended",
            },
          },
        ],
        hideDropZone: false,
      },
    },
    DrawBoundary: {
      type: 10,
      data: {
        howMeasured: "",
        policyRef: "",
        info: "",
        title: "Confirm your location plan",
        description: "",
        titleForUploading: "Upload a location plan",
        descriptionForUploading: "",
        hideFileUpload: false,
        fn: "proposal.site",
      },
    },
  };

  act(() => setState({ flow, breadcrumbs }));

  const { user } = await setup(
    <DrawBoundary
      fn="proposal.site"
      description=""
      descriptionForUploading=""
      title="Draw a boundary"
      titleForUploading="Upload a file"
      handleSubmit={handleSubmit}
    />,
  );

  // Check current passport setup
  const existingRequestedFiles = getState().requestedFiles();
  expect(existingRequestedFiles).toMatchObject({
    required: ["floorPlan", "utilityBill"],
    recommended: ["elevations.existing"],
    optional: [],
  });

  // Toggle to file upload mode
  await user.click(screen.getByTestId("upload-file-button"));

  // Upload file and continue
  const input = screen.getByTestId("upload-input");
  await user.upload(input, file);

  // Wait for upload to complete
  const progressBar = screen.getByRole("progressbar");
  await waitFor(() => {
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });

  await user.click(screen.getByTestId("continue-button"));

  const { required, recommended, optional } =
    handleSubmit.mock.calls[0][0].data[PASSPORT_REQUESTED_FILES_KEY];

  // Current file key has been added to required
  expect(required).toContain(PASSPORT_UPLOAD_KEY);

  // Previous file keys have not been overwritten
  expect(required).toContain("floorPlan");
  expect(required).toContain("utilityBill");

  // Recommended and optional keys untouched
  expect(recommended).toEqual(["elevations.existing"]);
  expect(optional).toHaveLength(0);
});

test("submits data based on the page you continue onwards from", async () => {
  // Context - Planning Officers don't want to receive both geojson and an uploaded locationPlan, only one or the other
  //   But accessibility auditing says a user should always be able to toggle between draw & upload pages with their previous inputs retained

  const handleSubmit = vi.fn();

  const file = new File(["test"], "test.png", { type: "image/png" });

  // Previously submitted data is a good proxy for having previously fetched a title boundary and arriving to Draw with geojson in passport !
  const previouslySubmittedData = {
    "proposal.site": {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-0.07643975531307334, 51.485847769536015],
            [-0.0764006164494183, 51.4855918619739],
            [-0.07587615567891393, 51.48561867140494],
            [-0.0759899845402056, 51.48584045791162],
            [-0.07643975531307334, 51.485847769536015],
          ],
        ],
      },
    },
  };

  const { user } = await setup(
    <DrawBoundary
      fn="proposal.site"
      description=""
      descriptionForUploading=""
      title="Draw a boundary"
      titleForUploading="Upload a file"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: previouslySubmittedData,
      }}
    />,
  );

  // Toggle to file upload mode
  await user.click(screen.getByTestId("upload-file-button"));

  // Upload file
  const input = screen.getByTestId("upload-input");
  await user.upload(input, file);
  expect(mockedUploadPrivateFile).toHaveBeenCalled();

  // Toggle back to map view after uploading
  await user.click(screen.getByTestId("use-map-button"));

  // Click "continue" from map page
  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);

  // Confirm that file is NOT saved to passport, but geojson is
  const submitted = handleSubmit.mock.calls[0][0];
  expect(submitted.data).not.toHaveProperty(PASSPORT_UPLOAD_KEY);
  expect(submitted.data["proposal.site"]).toEqual(
    previouslySubmittedData["proposal.site"],
  );

  // DrawBoundary action captured correctly based on page
  expect(submitted.data[PASSPORT_COMPONENT_ACTION_KEY]).toEqual(
    DrawBoundaryUserAction.Draw,
  );
});
