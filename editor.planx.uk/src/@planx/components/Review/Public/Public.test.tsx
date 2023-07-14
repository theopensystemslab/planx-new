import { act, screen } from "@testing-library/react";
import { FullStore, vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { axe, setup } from "testUtils";

import {
  breadcrumbsWithEmptySections,
  flowWithEmptySections,
  passportWithEmptySections,
} from "./mocks/emptySections";
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

const { getState, setState } = vanillaStore;

let initialState: FullStore;

beforeAll(() => (initialState = getState()));

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
      />,
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
      />,
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
      />,
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
      />,
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
      />,
    );

    const element = getByTestId("uploaded-plan-name");

    await expect(element).toBeInTheDocument();
  });
});

describe("Flow with sections", () => {
  beforeEach(() => {
    act(() => {
      setState({
        flow: flowWithSections,
        breadcrumbs: breadcrumbsWithSections,
      });
      getState().initNavigationStore();
    });
  });

  afterEach(() => act(() => setState(initialState)));

  it("renders correctly", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <Review
        title="Review with sections"
        description="Check your answers before submitting"
        flow={flowWithSections}
        breadcrumbs={breadcrumbsWithSections}
        passport={passportWithSections}
        changeAnswer={jest.fn()}
        handleSubmit={handleSubmit}
        showChangeButton={true}
      />,
    );

    // there is an overall Review title
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Review with sections",
    );

    // there are section titles
    expect(screen.getByText("About the property")).toBeInTheDocument();
    expect(screen.getByText("About the project")).toBeInTheDocument();

    await user.click(screen.getByTestId("continue-button"));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <Review
        title="Review with sections"
        description="Check your answers before submitting"
        flow={flowWithSections}
        breadcrumbs={breadcrumbsWithSections}
        passport={passportWithSections}
        changeAnswer={jest.fn()}
        handleSubmit={jest.fn()}
        showChangeButton={true}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Flow with empty sections", () => {
  beforeEach(() => {
    act(() => {
      setState({
        flow: flowWithEmptySections,
        breadcrumbs: breadcrumbsWithEmptySections,
      });
      getState().initNavigationStore();
    });
  });

  afterEach(() => act(() => setState(initialState)));

  test("headers display as expected", async () => {
    setup(
      <Review
        title="Review with empty sections"
        description="Check your answers before submitting"
        flow={flowWithEmptySections}
        breadcrumbs={breadcrumbsWithEmptySections}
        passport={passportWithEmptySections}
        changeAnswer={jest.fn()}
        handleSubmit={jest.fn()}
        showChangeButton={true}
      />,
    );

    // Overall header displays
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Review with empty sections",
    );

    // Section with presentational components is displayed
    expect(screen.getByText("This is a real section")).toBeInTheDocument();

    // Section without components is not displayed
    expect(
      screen.queryByText("This is an empty section"),
    ).not.toBeInTheDocument();

    // Section without presentational components is not displayed
    expect(
      screen.queryByText("This is a section without presentational components"),
    ).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <Review
        title="Review with empty sections"
        description="Check your answers before submitting"
        flow={flowWithEmptySections}
        breadcrumbs={breadcrumbsWithEmptySections}
        passport={passportWithEmptySections}
        changeAnswer={jest.fn()}
        handleSubmit={jest.fn()}
        showChangeButton={true}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
