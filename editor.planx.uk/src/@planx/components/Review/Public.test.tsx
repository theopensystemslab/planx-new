import { screen } from "@testing-library/react";
import React from "react";
import { axe, setup } from "testUtils";

import Review from "./Public/Presentational";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={{}}
      breadcrumbs={{}}
      passport={{}}
      changeAnswer={() => {}}
      handleSubmit={handleSubmit}
      showChangeButton={true}
    />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Review");

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("REGRESSION: doesn't return undefined when multiple nodes are filled", async () => {
  const handleSubmit = jest.fn();

  setup(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={mockedFlow}
      breadcrumbs={mockedBreadcrumbs}
      passport={mockedPassport}
      changeAnswer={() => {}}
      handleSubmit={handleSubmit}
      showChangeButton={true}
    />
  );

  expect(screen.getByText("This is a text")).toBeTruthy();
  expect(screen.getByText("356")).toBeTruthy();
  expect(screen.getByText("Option 2")).toBeTruthy();
  expect(screen.queryAllByText("undefined")).toHaveLength(0);
});

const mockedBreadcrumbs = {
  ZM31xEWH2c: {
    auto: false,
    data: {
      ZM31xEWH2c: 356,
    },
  },
  "1A14DTRw0d": {
    auto: false,
    data: {
      "1A14DTRw0d": "This is a text",
    },
  },
  duzkfXlWGn: {
    auto: false,
    answers: ["iWvI9QkgIT"],
  },
};
const mockedPassport = {
  data: {
    ZM31xEWH2c: 356,
    "1A14DTRw0d": "This is a text",
  },
};
const mockedFlow = {
  _root: { edges: ["ZM31xEWH2c", "1A14DTRw0d", "duzkfXlWGn", "EJBY2zSbmL"] },
  "1A14DTRw0d": { data: { title: "Input a text" }, type: 110 },
  EJBY2zSbmL: { type: 600 },
  ZM31xEWH2c: { data: { title: "Input a number" }, type: 150 },
  duzkfXlWGn: {
    data: { text: "Select the desired options", allRequired: false },
    type: 105,
    edges: ["ky2QQWHgi5", "iWvI9QkgIT", "nyYCBQs24s"],
  },
  iWvI9QkgIT: { data: { text: "Option 2" }, type: 200 },
  ky2QQWHgi5: { data: { text: "Option 1" }, type: 200 },
  nyYCBQs24s: { data: { text: "Option 3" }, type: 200 },
};

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={mockedFlow}
      breadcrumbs={mockedBreadcrumbs}
      passport={mockedPassport}
      changeAnswer={() => {}}
      showChangeButton={true}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

const mockLink = "my-file.png";
const uploadedPlanUrl = "http://someurl.com/whjhnh65/plan.png";

beforeEach(() => {
  global.URL = {
    createObjectURL: jest.fn(() => mockLink),
  } as any;
});

it("should render file upload filename", async () => {
  const { getByTestId } = setup(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={fileUploadFlow}
      breadcrumbs={fileUploadBreadcrumbs}
      passport={fileUploadPassport}
      changeAnswer={() => {}}
      showChangeButton={true}
    />
  );

  const element = getByTestId("file-upload-name");

  await expect(element).toHaveTextContent(mockLink);
});

it("should render uploaded location plan link", async () => {
  const { getByTestId } = setup(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={drawBoundaryFlow}
      breadcrumbs={uploadedPlansBreadcrumb}
      passport={uploadedPlansPassport}
      changeAnswer={() => {}}
      showChangeButton={true}
    />
  );

  const element = getByTestId("uploaded-plan-name");

  await expect(element).toBeInTheDocument();
});

const fileUploadBreadcrumbs = {
  fileUpload: {
    auto: false,
    data: {
      fileUpload: [
        {
          filename: "my-file.png",
        },
      ],
    },
  },
};

const fileUploadFlow = {
  _root: {
    edges: ["fileUpload", "review"],
  },
  review: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
  fileUpload: {
    data: {
      color: "#EFEFEF",
    },
    type: 140,
  },
};

const fileUploadPassport = {
  data: {
    fileUpload: [
      {
        serverFile: {
          fileHash:
            "8c91f81b213865af9632d2296039984753f0e41cfe234ba1dce65ad58568209b",
          fileId: "0702enth/my-file.png",
        },
        filename: "my-file.png",
      },
    ],
  },
};

const uploadedPlansBreadcrumb = {
  IHTyNVZqon: {
    auto: false,
    data: {
      _address: {
        uprn: "200003453481",
        blpu_code: "2",
        latitude: 51.4858354,
        longitude: -0.0761504,
        organisation: null,
        pao: "49",
        street: "COBOURG ROAD",
        town: "LONDON",
        postcode: "SE5 0HU",
        x: 533676,
        y: 178075,
        planx_description: "Terrace",
        planx_value: "residential.dwelling.house.terrace",
        single_line_address: "49, COBOURG ROAD, LONDON, SOUTHWARK, SE5 0HU",
        title: "49, COBOURG ROAD, LONDON",
      },
      "property.type": ["residential.dwelling.house.terrace"],
      "property.localAuthorityDistrict": ["Southwark"],
      "property.region": ["London"],
    },
  },
  EO6DzPso8o: {
    auto: false,
    data: {
      "proposal.drawing.locationPlan": uploadedPlanUrl,
      "property.uploadedFile": {
        file: {
          path: "fut.email.png",
        },
        status: "success",
        progress: 1,
        id: "u6jFS4xJ-MM9Gsg1o2ZsI",
        url: uploadedPlanUrl,
      },
    },
  },
};

const uploadedPlansPassport = {
  data: {
    _address: {
      uprn: "200003453481",
      blpu_code: "2",
      latitude: 51.4858354,
      longitude: -0.0761504,
      organisation: null,
      pao: "49",
      street: "COBOURG ROAD",
      town: "LONDON",
      postcode: "SE5 0HU",
      x: 533676,
      y: 178075,
      planx_description: "Terrace",
      planx_value: "residential.dwelling.house.terrace",
      single_line_address: "49, COBOURG ROAD, LONDON, SOUTHWARK, SE5 0HU",
      title: "49, COBOURG ROAD, LONDON",
    },
    "property.type": ["residential.dwelling.house.terrace"],
    "property.localAuthorityDistrict": ["Southwark"],
    "property.region": ["London"],
    "proposal.drawing.locationPlan": {
      url: uploadedPlanUrl,
    },
    "property.uploadedFile": {
      file: {
        path: "fut.email.png",
      },
      status: "success",
      progress: 1,
      id: "u6jFS4xJ-MM9Gsg1o2ZsI",
      url: uploadedPlanUrl,
    },
  },
};

const drawBoundaryFlow = {
  _root: {
    edges: ["IHTyNVZqon", "EO6DzPso8o", "ZNUl9Kr2ib"],
  },
  EO6DzPso8o: {
    data: {
      title: "Draw the boundary of the property",
      dataFieldArea: "property.boundary.area",
      hideFileUpload: false,
      dataFieldBoundary: "property.boundary.site",
      titleForUploading: "Upload a location plan",
    },
    type: 10,
  },
  IHTyNVZqon: {
    data: {
      description: "<p>For example CM7 3YL</p>",
    },
    type: 9,
  },
  ZNUl9Kr2ib: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
};
