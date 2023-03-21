import { screen } from "@testing-library/react";
import { hasFeatureFlag, toggleFeatureFlag } from "lib/featureFlags";
import { vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import * as ReactNavi from "react-navi";
import { axe, setup } from "testUtils";
import { Team } from "types";

import flowWithoutSections from "../pages/FlowEditor/lib/__tests__/mocks/flowWithClones.json";
import flowWithThreeSections from "../pages/FlowEditor/lib/__tests__/mocks/flowWithThreeSections.json";
import Header, { HeaderVariant } from "./Header";

const { setState, getState } = vanillaStore;

const mockTeam1: Team = {
  name: "Open Systems Lab",
  slug: "opensystemslab",
  theme: {
    logo: "logo.jpg",
  },
};

const mockTeam2: Team = {
  name: "Closed Systems Lab",
  slug: "closedsystemslab",
};

jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
  () =>
    ({
      url: {
        href: "test",
        pathname: "/opensystemslab/test-flow/preview",
      },
      data: {
        username: "Test User",
        team: mockTeam1.slug,
        flow: "test-flow",
      },
    } as any)
);

jest.spyOn(ReactNavi, "useNavigation").mockImplementation(
  () =>
    ({
      data: {
        team: mockTeam1,
      },
    } as any)
);

describe("Header Component - Editor Route", () => {
  it("displays breadcrumbs", () => {
    setup(<Header variant={HeaderVariant.Editor} team={mockTeam1}></Header>);
    expect(screen.getByText("Plan✕")).toBeInTheDocument();
    expect(screen.getByText(mockTeam1.slug)).toBeInTheDocument();
    expect(screen.getByText("test-flow")).toBeInTheDocument();
  });

  it("displays avatar and settings", () => {
    setup(<Header variant={HeaderVariant.Editor} team={mockTeam1}></Header>);
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle Menu")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <Header variant={HeaderVariant.Editor} team={mockTeam1}></Header>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Header Component - Public Routes", () => {
  it("displays a logo when available", () => {
    setup(<Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>);
    expect(screen.queryByText("Plan✕")).not.toBeInTheDocument();
    expect(screen.getByAltText(`${mockTeam1.name} Logo`)).toHaveAttribute(
      "src",
      "logo.jpg"
    );
  });

  it("falls back to the PlanX link when a logo is not present", () => {
    setup(<Header variant={HeaderVariant.Preview} team={mockTeam2}></Header>);
    expect(
      screen.queryByAltText(`${mockTeam2.name} Logo`)
    ).not.toBeInTheDocument();
    expect(screen.getByText("Plan✕")).toBeInTheDocument();
  });

  it("displays service title from the store", () => {
    setup(<Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>);
    act(() => setState({ flowName: "test flow" }));

    expect(screen.getByTestId("service-title")).toBeInTheDocument();
    expect(screen.getByText("test flow")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe("Section navigation bar", () => {
    describe("Flow without sections", () => {
      it("does not display if the feature flag is disabled", () => {
        setup(
          <Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>
        );
        act(() => setState({ flow: flowWithoutSections }));
        act(() => getState().initNavigationStore());

        expect(hasFeatureFlag("NAVIGATION_UI")).toBe(false);
        expect(screen.queryByTestId("navigation-bar")).not.toBeInTheDocument();
      });

      it("does not display if the feature flag is enabled", () => {
        toggleFeatureFlag("NAVIGATION_UI");
        setup(
          <Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>
        );
        act(() => setState({ flow: flowWithoutSections }));
        act(() => getState().initNavigationStore());

        expect(hasFeatureFlag("NAVIGATION_UI")).toBe(true);
        expect(screen.queryByTestId("navigation-bar")).not.toBeInTheDocument();
      });
    });

    describe("Flow with sections", () => {
      beforeEach(() => {
        if (hasFeatureFlag("NAVIGATION_UI")) {
          toggleFeatureFlag("NAVIGATION_UI");
        }
      });

      it("does not display if the feature flag is disabled", () => {
        act(() => setState({ flow: flowWithThreeSections }));
        act(() => getState().initNavigationStore());
        setup(
          <Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>
        );

        expect(hasFeatureFlag("NAVIGATION_UI")).toBe(false);
        expect(screen.queryByTestId("navigation-bar")).not.toBeInTheDocument();
      });

      it("displays if the feature flag is enabled", () => {
        toggleFeatureFlag("NAVIGATION_UI");
        act(() => setState({ flow: flowWithThreeSections }));
        act(() => getState().initNavigationStore());
        setup(
          <Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>
        );

        expect(hasFeatureFlag("NAVIGATION_UI")).toBe(true);
        expect(screen.getByTestId("navigation-bar")).toBeInTheDocument();
      });

      it("display the correct information from the store", () => {
        toggleFeatureFlag("NAVIGATION_UI");
        act(() => setState({ flow: flowWithThreeSections }));
        act(() => getState().initNavigationStore());
        setup(
          <Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>
        );

        expect(screen.getByText("Section 1 of 3")).toBeInTheDocument();
        expect(screen.getByText("First section")).toBeInTheDocument();
      });

      it("should not have any accessibility violations", async () => {
        toggleFeatureFlag("NAVIGATION_UI");
        act(() => setState({ flow: flowWithThreeSections }));
        act(() => getState().initNavigationStore());
        const { container } = setup(
          <Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });
});
