import { Breadcrumbs } from "@opensystemslab/planx-core/types";
import { PASSPORT_REQUESTED_FILES_KEY } from "@planx/components/FileUploadAndLabel/model";
import { screen } from "@testing-library/react";
import axios from "axios";
import { vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import { axe, setup } from "testUtils";

import {
  DrawBoundaryUserAction,
  PASSPORT_COMPONENT_ACTION_KEY,
  PASSPORT_UPLOAD_KEY,
} from "../model";
import DrawBoundary from "./";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
global.URL.createObjectURL = jest.fn();

const { getState, setState } = vanillaStore;

test("recovers previously submitted files when clicking the back button", async () => {
  const handleSubmit = jest.fn();
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

  const { user } = setup(
    <DrawBoundary
      dataFieldBoundary="property.boundary.site"
      dataFieldArea="property.area.site"
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
  const handleSubmit = jest.fn();
  const previouslySubmittedData = {
    "property.boundary.site": {
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

  const { user } = setup(
    <DrawBoundary
      dataFieldBoundary="property.boundary.site"
      dataFieldArea="property.area.site"
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
  const { container } = setup(
    <DrawBoundary
      dataFieldBoundary="property.boundary.site"
      dataFieldArea="property.area.site"
      description="description1"
      descriptionForUploading="description1"
      title="Draw a boundary"
      titleForUploading="Upload a file"
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("shows the file upload option by default and requires user data to continue", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <DrawBoundary
      dataFieldBoundary="property.boundary.site"
      dataFieldArea="property.area.site"
      description=""
      descriptionForUploading=""
      title="Draw a boundary"
      titleForUploading="Upload a file"
      handleSubmit={handleSubmit}
    />,
  );

  // Draw a boundary screen
  expect(screen.getByTestId("upload-file-button")).toBeInTheDocument();
  expect(screen.getByTestId("continue-button")).toBeDisabled();

  // Navigate to upload a file screen
  await user.click(screen.getByTestId("upload-file-button"));
  expect(screen.getByText("Upload a file")).toBeInTheDocument();
  expect(screen.getByTestId("continue-button")).toBeDisabled();
});

test("hides the upload option and allows user to continue without drawing if editor specifies", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <DrawBoundary
      dataFieldBoundary="property.boundary.site"
      dataFieldArea="property.area.site"
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
  // Setup file mock
  const mockFileName = "test.png";
  const mockFileURL =
    "https://api.editor.planx.dev/file/private/gws7l5d1/test.png";

  const file = new File(["test"], mockFileName, { type: "image/png" });

  const mockedPost = mockedAxios.post.mockResolvedValueOnce({
    data: {
      fileType: "image/png",
      fileUrl: mockFileURL,
    },
  });

  const handleSubmit = jest.fn();

  const { user } = setup(
    <DrawBoundary
      dataFieldBoundary="property.boundary.site"
      dataFieldArea="property.area.site"
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
  expect(mockedPost).toHaveBeenCalled();

  await user.click(screen.getByTestId("continue-button"));
  const submitted = handleSubmit.mock.calls[0][0];

  // DrawBoundary passport variable set
  expect(submitted.data).toHaveProperty(PASSPORT_UPLOAD_KEY);
  expect(submitted.data.locationPlan).toHaveLength(1);
  expect(submitted.data.locationPlan[0].url).toEqual(mockFileURL);
  expect(submitted.data.locationPlan[0].file.path).toEqual(mockFileName);

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
  // Setup file mock
  const mockFileName = "test.png";
  const mockFileURL =
    "https://api.editor.planx.dev/file/private/gws7l5d1/test.png";

  const file = new File(["test"], mockFileName, { type: "image/png" });

  mockedAxios.post.mockResolvedValueOnce({
    data: {
      fileType: "image/png",
      fileUrl: mockFileURL,
    },
  });

  const handleSubmit = jest.fn();

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
        dataFieldBoundary: "property.boundary.site",
        dataFieldArea: "property.boundary.area",
      },
    },
  };

  act(() => setState({ flow, breadcrumbs }));

  const { user } = setup(
    <DrawBoundary
      dataFieldBoundary="property.boundary.site"
      dataFieldArea="property.area.site"
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
