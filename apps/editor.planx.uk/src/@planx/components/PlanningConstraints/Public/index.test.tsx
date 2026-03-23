import { act } from "@testing-library/react";
import ErrorFallback from "components/Error/ErrorFallback";
import { http, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import server from "test/mockServer";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import classifiedRoadsResponseMock from "../mocks/classifiedRoadsResponseMock";
import digitalLandResponseMock from "../mocks/digitalLandResponseMock";
import {
  breadcrumbsWithoutUSRN,
  simpleBreadcrumbs,
  simpleFlow,
} from "../mocks/simpleFlow";
import { availableDatasets } from "../model";
import PlanningConstraints from ".";

const { setState } = useStore;

const API_URL = import.meta.env.VITE_APP_API_URL;

const handlers = [
  // GIS requests
  http.get(`${API_URL}/gis/*`, () => {
    return HttpResponse.json(digitalLandResponseMock);
  }),
  // Classified roads requests
  http.get(`${API_URL}/roads`, () => {
    return HttpResponse.json(classifiedRoadsResponseMock);
  }),
];

beforeEach(() => {
  vi.clearAllMocks();
  server.use(...handlers);
});

describe("error state", () => {
  it("renders an error if no address is present in the passport", async () => {
    const { getByRole, getByTestId } = await setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlanningConstraints
          title="Planning constraints"
          description="Things that might affect your project"
          fn="property.constraints.planning"
          disclaimer="This page does not include information about historic planning conditions that may apply to this property."
          handleSubmit={vi.fn()}
          dataValues={["test1", "test2", "test3"]}
        />
      </ErrorBoundary>,
    );

    expect(getByTestId("error-summary-invalid-graph")).toBeInTheDocument();
    expect(getByRole("heading", { name: "Invalid graph" })).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlanningConstraints
          title="Planning constraints"
          description="Things that might affect your project"
          fn="property.constraints.planning"
          disclaimer="This page does not include information about historic planning conditions that may apply to this property."
          dataValues={["test1", "test2", "test3"]}
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

    const { user, getByRole, getByTestId, findByRole } = await setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={handleSubmit}
        dataValues={["test1", "test2", "test3"]}
      />,
    );

    expect(
      getByRole("heading", { name: "Planning constraints" }),
    ).toBeInTheDocument();

    expect(
      await findByRole("button", { name: /Parks and gardens/ }),
    ).toBeVisible();

    await user.click(getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalled();

    // planxRequest url is logged for auditing
    expect(handleSubmit.mock.calls[0][0].data._constraints[0]).toHaveProperty(
      "planxRequest",
      expect.stringMatching(/http/),
    );

    // Plain `url` is not logged
    expect(
      handleSubmit.mock.calls[0][0].data._constraints[0],
    ).not.toHaveProperty("url");
  });

  it("should not have any accessibility violations", async () => {
    const { container, findByRole } = await setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        dataValues={["test1", "test2", "test3"]}
      />,
    );

    expect(
      await findByRole("button", { name: /Parks and gardens/ }),
    ).toBeVisible();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("fetches planning constraints when we have lng, lat or siteBoundary", async () => {
    const { findByRole } = await setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
        dataValues={["test1", "test2", "test3"]}
      />,
    );

    expect(
      await findByRole("button", { name: /Parks and gardens/ }),
    ).toBeVisible();
  });

  it("fetches classified roads when a USRN is provided", async () => {
    const { findByRole } = await setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
        dataValues={["test1", "test2", "test3", "road.classified"]}
      />,
    );

    expect(
      await findByRole("button", { name: /Classified roads/ }),
    ).toBeVisible();

    expect(
      await findByRole("button", { name: /Parks and gardens/ }),
    ).toBeVisible();
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

    const { findByRole, queryByRole } = await setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
        dataValues={["test1", "test2", "test3", "road.classified"]}
      />,
    );

    // GIS data present
    expect(
      await findByRole("button", { name: /Parks and gardens/ }),
    ).toBeVisible();

    // Roads data not present
    expect(
      queryByRole("button", { name: /Classified roads/ }),
    ).not.toBeInTheDocument();
  });

  test("basic layout and interactions", async () => {
    const { user, getByRole, queryByRole, getByTestId, findByRole } =
      await setup(
        <PlanningConstraints
          title="Planning constraints"
          description="Things that might affect your project"
          fn="property.constraints.planning"
          disclaimer="This page does not include information about historic planning conditions that may apply to this property."
          handleSubmit={vi.fn()}
          dataValues={["test1", "test2", "test3"]}
        />,
      );

    expect(
      await findByRole("button", { name: /Parks and gardens/ }),
    ).toBeVisible();

    // Positive constraints visible by default
    expect(
      getByRole("heading", { name: /These are the planning constraints/ }),
    ).toBeVisible();

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
    const { queryByText, findByRole } = await setup(
      // @ts-ignore - we deliberately want to test the case where PlanningConstraints is missing the disclaimer prop
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        handleSubmit={vi.fn()}
      />,
    );

    expect(
      await findByRole("button", { name: /Parks and gardens/ }),
    ).toBeVisible();

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
    const { findByRole, queryByRole } = await setup(
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

    // GIS data present
    expect(
      await findByRole("button", { name: /Parks and gardens/ }),
    ).toBeVisible();

    // Roads data not present
    expect(
      queryByRole("button", { name: /Classified roads/ }),
    ).not.toBeInTheDocument();
  });

  it("does not initiate `/gis/:localAuthority` request when only `road.classified` is selected by an editor", async () => {
    const { queryByRole, findByRole } = await setup(
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        handleSubmit={vi.fn()}
        dataValues={["road.classified"]}
      />,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // GIS data not present
    expect(
      queryByRole("button", { name: /Parks and gardens/ }),
    ).not.toBeInTheDocument();

    // Roads data present
    expect(
      await findByRole("button", { name: /Classified roads/ }),
    ).toBeVisible();
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
    const { queryByText, queryByRole, user, getByTestId } = await setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlanningConstraints
          title="Planning constraints"
          description="Things that might affect your project"
          fn="property.constraints.planning"
          disclaimer="This page does not include information about historic planning conditions that may apply to this property."
          handleSubmit={handleSubmit}
          dataValues={["test1", "test2", "test3"]}
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
