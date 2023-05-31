import { act, screen } from "@testing-library/react";
import { FullStore, vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { axe, setup } from "testUtils";

import {
  drawBoundaryFlow,
  fileUploadBreadcrumbs,
  fileUploadFlow,
  fileUploadPassport,
  mockLink,
  uploadedPlansBreadcrumb,
  uploadedPlansPassport,
} from "./mocks/fileUpload";
import {
  breadcrumbsWithSections,
  flowWithSections,
  passportWithSections,
} from "./mocks/sections";
import { mockedBreadcrumbs, mockedFlow, mockedPassport } from "./mocks/simple";
import Review from "./Presentational";

describe("Simple flow", () => {
  it("renders correctly", async () => {
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

  it("doesn't return undefined when multiple nodes are filled", async () => {
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
});

describe("File uploads", () => {
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
});

describe("Flow with sections", () => {
  const { getState, setState } = vanillaStore;

  let initialState: FullStore;

  beforeAll(() => (initialState = getState()));
  afterEach(() => act(() => setState(initialState)));

  it("renders correctly", async () => {
    act(() =>
      setState({ flow: flowWithSections, breadcrumbs: breadcrumbsWithSections })
    );
    act(() => getState().initNavigationStore());
    const handleSubmit = jest.fn();

    const { user } = setup(
      <Review
        title="Review with sections"
        description="Check your answers before submitting"
        flow={flowWithSections}
        breadcrumbs={breadcrumbsWithSections}
        passport={passportWithSections}
        changeAnswer={() => {}}
        handleSubmit={handleSubmit}
        showChangeButton={true}
      />
    );

    // there is an overall Review title
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Review with sections"
    );

    // there are section titles
    expect(screen.getByText("About the property")).toBeInTheDocument();
    expect(screen.getByText("About the project")).toBeInTheDocument();

    await user.click(screen.getByTestId("continue-button"));
    expect(handleSubmit).toHaveBeenCalled();
  });
});
