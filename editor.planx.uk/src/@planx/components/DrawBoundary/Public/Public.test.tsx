import { screen } from "@testing-library/react";
import React from "react";
import { axe, setup } from "testUtils";

import DrawBoundary from "./";

test("recovers previously submitted files when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const previouslySubmittedData = {
    "proposal.drawing.locationPlan": [
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
