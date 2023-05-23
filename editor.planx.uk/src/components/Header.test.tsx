import { screen } from "@testing-library/react";
import { vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import * as ReactNavi from "react-navi";
import { axe, setup } from "testUtils";
import { Team } from "types";

import flowWithoutSections from "../pages/FlowEditor/lib/__tests__/mocks/flowWithClones.json";
import flowWithThreeSections from "../pages/FlowEditor/lib/__tests__/mocks/flowWithThreeSections.json";
import Header from "./Header";

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

jest.spyOn(ReactNavi, "useNavigation").mockImplementation(
  () =>
    ({
      data: {
        team: mockTeam1,
      },
    } as any)
);

describe("Header Component - Editor Route", () => {
  beforeAll(() => {
    act(() =>
      setState({
        previewEnvironment: "editor",
        teamName: mockTeam1.name,
        teamSettings: mockTeam1.settings,
        teamTheme: mockTeam1.theme,
        teamSlug: mockTeam1.slug,
      })
    );

    jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
      () =>
        ({
          url: {
            href: "test",
            pathname: "/team-name/flow-name",
          },
          data: {
            username: "Test User",
            flow: "test-flow",
            team: mockTeam1.slug,
          },
        } as any)
    );
  });

  afterAll(() => {
    setState({ previewEnvironment: "standalone" });
  });

  it("displays breadcrumbs", () => {
    setup(<Header />);
    expect(screen.getByText("Plan✕")).toBeInTheDocument();
    expect(screen.getByText(mockTeam1.slug)).toBeInTheDocument();
    expect(screen.getByText("test-flow")).toBeInTheDocument();
  });

  it("displays avatar and settings", () => {
    setup(<Header />);
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle Menu")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

for (const route of ["/preview", "/unpublished", "/pay", "/invite"]) {
  describe(`Header Component - ${route} Routes`, () => {
    beforeAll(() => {
      jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
        () =>
          ({
            url: {
              href: "test",
              pathname: "/opensystemslab/test-flow" + route,
            },
            data: {
              username: "Test User",
              flow: "test-flow",
            },
          } as any)
      );
    });

    it("displays a logo when available", () => {
      setup(<Header />);
      expect(screen.queryByText("Plan✕")).not.toBeInTheDocument();
      expect(screen.getByAltText(`${mockTeam1.name} Logo`)).toHaveAttribute(
        "src",
        "logo.jpg"
      );
    });

    it("falls back to the PlanX link when a logo is not present", () => {
      act(() => setState({ teamTheme: mockTeam2.theme }));
      setup(<Header />);
      expect(
        screen.queryByAltText(`${mockTeam2.name} Logo`)
      ).not.toBeInTheDocument();
      expect(screen.getByText("Plan✕")).toBeInTheDocument();
      act(() => setState({ teamTheme: mockTeam1.theme }));
    });

    it("displays service title from the store", () => {
      setup(<Header />);
      act(() => setState({ flowName: "test flow" }));

      expect(screen.getByTestId("service-title")).toBeInTheDocument();
      expect(screen.getByText("test flow")).toBeInTheDocument();
    });

    it("should not have any accessibility violations", async () => {
      const { container } = setup(<Header />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
}

describe("Section navigation bar", () => {
  beforeAll(() => {
    jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
      () =>
        ({
          url: {
            href: "test",
            pathname: "/team-name/flow-name/preview",
          },
          data: {
            username: "Test User",
            flow: "test-flow",
          },
        } as any)
    );
  });

  describe("Flow without sections", () => {
    it("does not display", () => {
      setup(<Header/>);
      act(() => setState({ flow: flowWithoutSections }));
      act(() => getState().initNavigationStore());

      expect(screen.queryByTestId("navigation-bar")).not.toBeInTheDocument();
    });
  });

  describe("Flow with sections", () => {
    it("displays as expected", () => {
      act(() => setState({ flow: flowWithThreeSections }));
      act(() => getState().initNavigationStore());
      setup(<Header />);

      expect(screen.getByTestId("navigation-bar")).toBeInTheDocument();
    });

    it("display the correct information from the store", () => {
      act(() => setState({ flow: flowWithThreeSections }));
      act(() => getState().initNavigationStore());
      setup(<Header />);

      expect(screen.getByText("Section 1 of 3")).toBeInTheDocument();
      expect(screen.getByText("First section")).toBeInTheDocument();
    });

    it("should not have any accessibility violations", async () => {
      act(() => setState({ flow: flowWithThreeSections }));
      act(() => getState().initNavigationStore());
      const { container } = setup(<Header />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
