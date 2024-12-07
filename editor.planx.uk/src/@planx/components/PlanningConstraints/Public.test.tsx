import ErrorFallback from "components/Error/ErrorFallback";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import { ErrorBoundary } from "react-error-boundary";
import swr from "swr";
import useSWR from "swr";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import classifiedRoadsResponseMock from "./mocks/classifiedRoadsResponseMock";
import digitalLandResponseMock from "./mocks/digitalLandResponseMock";
import {
  breadcrumbsWithoutUSRN,
  simpleBreadcrumbs,
  simpleFlow,
} from "./mocks/simpleFlow";
import { availableDatasets } from "./model";
import PlanningConstraints from "./Public";

const { setState } = useStore;

beforeEach(() => vi.clearAllMocks());

vi.mock("swr", () => ({
  default: vi.fn((url: () => string) => {
    const isGISRequest = url()?.startsWith(
      `${import.meta.env.VITE_APP_API_URL}/gis`,
    );
    const isRoadsRequest = url()?.startsWith(
      `${import.meta.env.VITE_APP_API_URL}/roads`,
    );

    if (isGISRequest) return { data: digitalLandResponseMock };
    if (isRoadsRequest) return { data: classifiedRoadsResponseMock };

    return { data: null };
  }),
}));

describe("error state", () => {
  it("renders an error if no address is present in the passport", async () => {
    const { getByRole, getByTestId } = setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlanningConstraints
          title="Planning constraints"
          description="Things that might affect your project"
          fn="property.constraints.planning"
          disclaimer="This page does not include information about historic planning conditions that may apply to this property."
          handleSubmit={vi.fn()}
        />
      </ErrorBoundary>,
    );

    expect(getByTestId("error-summary-invalid-graph")).toBeInTheDocument();
    expect(getByRole("heading", { name: "Invalid graph" })).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlanningConstraints
          title="Planning constraints"
          description="Things that might affect your project"
          fn="property.constraints.planning"
          disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        />
      </ErrorBoundary>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("following a FindProperty component", () => {
  beforeEach(() => {
    act(() =>
      setState({
        breadcrumbs: simpleBreadcrumbs,
        flow: simpleFlow,
        teamIntegrations: {
          hasPlanningData: true,
        },
      }),
    );
  });

  it("renders correctly", async () => {
    const handleSubmit = vi.fn();

    const { user, getByRole, getByTestId } = setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={handleSubmit}
      />,
    );

    expect(
      getByRole("heading", { name: "Planning constraints" }),
    ).toBeInTheDocument();

    await user.click(getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalled();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("fetches planning constraints when we have lng, lat or siteBoundary", async () => {
    setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
      />,
    );

    expect(swr).toHaveBeenCalled();

    // Planning data is called first
    const swrURL = (vi.mocked(useSWR).mock.calls[0][0] as () => {})();
    const swrResponse = vi.mocked(useSWR).mock.results[0].value;

    expect(swrURL).toContain("/gis");
    expect(swrResponse).toEqual({ data: digitalLandResponseMock });
  });

  it("fetches classified roads when a USRN is provided", () => {
    setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
      />,
    );

    expect(swr).toHaveBeenCalled();

    // Classified roads are called second
    const swrURL = (vi.mocked(useSWR).mock.calls[1][0] as () => {})();
    const swrResponse = vi.mocked(useSWR).mock.results[1].value;

    expect(swrURL).toContain("/roads");
    expect(swrResponse).toEqual({ data: classifiedRoadsResponseMock });
  });

  it("does not fetch classified roads when a USRN is not provided", async () => {
    act(() =>
      setState({
        breadcrumbs: breadcrumbsWithoutUSRN,
        flow: simpleFlow,
        teamIntegrations: {
          hasPlanningData: true,
        },
      }),
    );

    setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
      />,
    );

    expect(swr).toHaveBeenCalled();

    // Planning constraints API still called
    const planingConstraintsURL = (
      vi.mocked(useSWR).mock.calls[0][0] as () => {}
    )();
    const planingConstraintsResponse = vi.mocked(useSWR).mock.results[0].value;

    expect(planingConstraintsURL).toContain("/gis");
    expect(planingConstraintsResponse).toEqual({
      data: digitalLandResponseMock,
    });

    // Classified roads API not called due to missing USRN
    const swrURL = (vi.mocked(useSWR).mock.calls[1][0] as () => {})();
    const swrResponse = vi.mocked(useSWR).mock.results[1].value;

    expect(swrURL).toBeNull();
    expect(swrResponse).toEqual({ data: null });
  });

  test("basic layout and interactions", async () => {
    const { user, getByRole, queryByRole, getByTestId } = setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
      />,
    );

    // Positive constraints visible by default
    expect(
      getByRole("heading", { name: /These are the planning constraints/ }),
    ).toBeVisible();
    expect(getByRole("button", { name: /Parks and gardens/ })).toBeVisible();

    // Negative constraints hidden by default
    const showNegativeConstraintsButton = getByRole("button", {
      name: /Constraints that don't apply/,
    });
    expect(showNegativeConstraintsButton).toBeVisible();

    const negativeConstraintsContainer = getByTestId(
      "negative-constraints-list",
    );
    expect(negativeConstraintsContainer).not.toBeVisible();

    expect(queryByRole("heading", { name: /Ecology/ })).not.toBeInTheDocument();

    // Negative constraints viewable on toggle
    await user.click(showNegativeConstraintsButton);

    expect(negativeConstraintsContainer).toBeVisible();
    expect(getByRole("heading", { name: /Ecology/ })).toBeVisible();
  });

  test("default disclaimer text should render if none provided", async () => {
    const { queryByText } = setup(
      // @ts-ignore - we deliberately want to test the case where PlanningConstraints is missing the disclaimer prop
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        handleSubmit={vi.fn()}
      />,
    );
    expect(
      queryByText(
        "This page does not include information about historic planning conditions that may apply to this property.",
      ),
    ).toBeVisible();
  });
});

describe("selectable datasets in editor", () => {
  beforeEach(() => {
    act(() =>
      setState({
        breadcrumbs: simpleBreadcrumbs,
        flow: simpleFlow,
        teamIntegrations: {
          hasPlanningData: true,
        },
      }),
    );
  });

  it("does not initiate `/roads` request when `road.classified` is not selected by an editor", async () => {
    setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
        dataValues={availableDatasets
          .filter((d) => d.val !== "road.classified")
          .map((d) => d.val)}
      />,
    );

    expect(swr).toHaveBeenCalled();

    // Planning constraints API still called
    const planingConstraintsURL = (
      vi.mocked(useSWR).mock.calls[0][0] as () => {}
    )();
    const planingConstraintsResponse = vi.mocked(useSWR).mock.results[0].value;

    expect(planingConstraintsURL).toContain("/gis");
    expect(planingConstraintsResponse).toEqual({
      data: digitalLandResponseMock,
    });

    // Roads API not called due to missing `road.classified` data value
    const roadsURL = (vi.mocked(useSWR).mock.calls[1][0] as () => {})();
    const roadsResponse = vi.mocked(useSWR).mock.results[1].value;

    expect(roadsURL).toBeNull();
    expect(roadsResponse).toEqual({ data: null });
  });

  it("does not initiate `/gis/:localAuthority` request when only `road.classified` is selected by an editor", async () => {
    setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
        dataValues={["road.classified"]}
      />,
    );

    expect(swr).toHaveBeenCalled();

    // Roads API is called
    const roadsURL = (vi.mocked(useSWR).mock.calls[1][0] as () => {})();
    const roadsResponse = vi.mocked(useSWR).mock.results[1].value;

    expect(roadsURL).toContain("/roads");
    expect(roadsResponse).toEqual({ data: classifiedRoadsResponseMock });

    // Planning constraints API not called due to missing data values
    const planingConstraintsURL = (
      vi.mocked(useSWR).mock.calls[0][0] as () => {}
    )();
    const planningConstraintsResponse = vi.mocked(useSWR).mock.results[0].value;

    expect(planingConstraintsURL).toBeNull();
    expect(planningConstraintsResponse).toEqual({ data: null });
  });
});

describe("demo state", () => {
  beforeEach(() => {
    act(() =>
      setState({
        breadcrumbs: simpleBreadcrumbs,
        flow: simpleFlow,
        teamIntegrations: {
          hasPlanningData: false,
        },
        teamSlug: "demo",
      }),
    );
  });
  it("should render an error when teamSlug is demo", async () => {
    const handleSubmit = vi.fn();
    const { queryByText, queryByRole, user, getByTestId } = setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlanningConstraints
          title="Planning constraints"
          description="Things that might affect your project"
          fn="property.constraints.planning"
          disclaimer="This page does not include information about historic planning conditions that may apply to this property."
          handleSubmit={handleSubmit}
        />
      </ErrorBoundary>,
    );

    const errorMessage = queryByText(
      "Planning Constraints are not enabled for demo users",
    );
    expect(errorMessage).toBeVisible();

    // Check planning constraints has not rendered
    // reused positive constraints from basic layout test
    expect(
      queryByRole("heading", { name: /These are the planning constraints/ }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole("button", { name: /Parks and gardens/ }),
    ).not.toBeInTheDocument();

    // Ensure a demo user can continue on in the application
    await user.click(getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalled();
  });
});
