import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";

import DrawBoundary from "./";

test("recovers previously submitted files when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const previouslySubmittedData = {
    "proposal.drawing.locationPlan":
      "http://127.0.0.1:9000/planx-temp/tdgg8gvf/file.pdf",
    "property.uploadedFile": {
      file: {
        path: "file.pdf",
        type: "application.pdf",
      },
      status: "success",
      progress: 1,
      id: "g5Xy36kAGY2k9xoTxtk_i",
      url: "http://127.0.0.1:9000/planx-temp/tdgg8gvf/file.pdf",
    },
  };

  render(
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
    />
  );

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: previouslySubmittedData,
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

  render(
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
    />
  );

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: expect.objectContaining(previouslySubmittedData),
  });
});

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <DrawBoundary
      dataFieldBoundary="property.boundary.site"
      dataFieldArea="property.area.site"
      description="description1"
      descriptionForUploading="description1"
      title="Draw a boundary"
      titleForUploading="Upload a file"
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
