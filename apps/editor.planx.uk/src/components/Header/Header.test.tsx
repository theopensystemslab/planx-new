import { Team } from "@opensystemslab/planx-core/types";
import { act, screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import * as ReactNavi from "react-navi";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import flowWithoutSections from "../../pages/FlowEditor/lib/__tests__/mocks/flowWithClones.json";
import flowWithThreeSections from "../../pages/FlowEditor/lib/__tests__/mocks/flowWithThreeSections.json";
import Header from "./Header";

const { setState, getState } = useStore;

const mockTeam1: Team = {
  id: 123,
  name: "Open Systems Lab",
  slug: "opensystemslab",
  integrations: {
    hasPlanningData: false,
  },
  theme: {
    logo: "logo.jpg",
    primaryColour: "#0010A4",
    actionColour: "#0010A4",
    linkColour: "#0010A4",
    favicon: null,
  },
  settings: {
    boundaryUrl: "https://www.planning.data.gov.uk/",
    helpEmail: "example@council.co.uk",
    helpPhone: "(01234) 56789",
    helpOpeningHours: "Monday - Friday, 9am - 5pm",
    emailReplyToId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
    referenceCode: "OSL",
    externalPlanningSiteName: "Open Planning",
    externalPlanningSiteUrl: "openplanning.com",
    isTrial: false,
  },
};

const mockTeam2: Team = {
  id: 456,
  name: "Closed Systems Lab",
  slug: "closedsystemslab",
  integrations: {
    hasPlanningData: false,
  },
  theme: {
    logo: null,
    primaryColour: "#0010A4",
    actionColour: "#0010A4",
    linkColour: "#0010A4",
    favicon: null,
  },
  settings: {
    boundaryUrl: "https://www.planning.data.gov.uk/",
    helpEmail: "example@council.co.uk",
    helpPhone: "(01234) 56789",
    helpOpeningHours: "Monday - Friday, 9am - 5pm",
    emailReplyToId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
    referenceCode: "CSL",
    externalPlanningSiteName: "Closed Planning",
    externalPlanningSiteUrl: "closedplanning.com",
    isTrial: false,
  },
};

vi.spyOn(ReactNavi, "useNavigation").mockReturnValue({
  navigate: vi.fn(),
} as any);

describe("Header Component - Editor Route", () => {
  beforeAll(() => {
    act(() =>
      setState({
        previewEnvironment: "editor",
        teamName: mockTeam1.name,
        teamSettings: mockTeam1.settings,
        teamTheme: mockTeam1.theme,
        teamSlug: mockTeam1.slug,
        user: {
          firstName: "Test",
          lastName: "User",
          isPlatformAdmin: false,
          isAnalyst: false,
          teams: [],
          id: 123,
          email: "test@example.com",
        },
      }),
    );

    vi.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
      () =>
        ({
          url: {
            href: "test",
            pathname: "/team-name/flow-name",
          },
          data: {
            flow: "test-flow",
          },
        }) as any,
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
    expect(screen.getByText("TU")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle Menu")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

for (const route of ["/published", "/preview", "/draft", "/pay", "/invite"]) {
  describe(`Header Component - ${route} Routes`, () => {
    beforeAll(() => {
      vi.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
        () =>
          ({
            url: {
              href: "test",
              pathname: "/opensystemslab/test-flow" + route,
            },
            data: {
              flow: "test-flow",
            },
          }) as any,
      );
    });

    it("displays a logo when available", () => {
      act(() => {
        setState({
          previewEnvironment: "standalone",
          teamTheme: mockTeam1.theme,
          teamName: mockTeam1.name,
          teamSlug: mockTeam1.slug,
        });
      });
      setup(<Header />);
      expect(screen.queryByText("Plan✕")).not.toBeInTheDocument();
      expect(screen.getByAltText(`${mockTeam1.name} Logo`)).toHaveAttribute(
        "src",
        "logo.jpg",
      );
    });

    it("falls back to the team name when a logo is not present", () => {
      act(() => {
        setState({
          previewEnvironment: "standalone",
          teamTheme: mockTeam2.theme,
          teamName: mockTeam2.name,
          teamSlug: mockTeam2.slug,
        });
      });
      setup(<Header />);
      expect(screen.getByText(mockTeam2.name)).toBeInTheDocument();
      expect(screen.queryByText("Plan✕")).not.toBeInTheDocument();
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
    vi.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
      () =>
        ({
          url: {
            href: "test",
            pathname: "/team-name/flow-name/published",
          },
          data: {
            flow: "test-flow",
          },
        }) as any,
    );
  });

  describe("Flow without sections", () => {
    it("does not display", () => {
      setup(<Header />);
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
