import { Team } from "@opensystemslab/planx-core/types";
import * as TanStackRouter from "@tanstack/react-router";
import { act, screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
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

vi.mock("ui/shared/CustomLink/CustomLink", () => ({
  CustomLink: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({})),
    useRouteContext: vi.fn(() => ({})),
  };
});

const mockUseLocation = vi.mocked(TanStackRouter.useLocation);
const mockUseParams = vi.mocked(TanStackRouter.useParams);

describe("Header Component - Editor Route", () => {
  beforeAll(() => {
    act(() =>
      setState({
        previewEnvironment: "editor",
        teamName: mockTeam1.name,
        teamSettings: mockTeam1.settings,
        teamTheme: mockTeam1.theme,
        teamSlug: mockTeam1.slug,
        flowName: "test-flow",
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

    mockUseLocation.mockReturnValue({
      pathname: "/team-name/flow-name",
      search: {},
      hash: "",
      href: "/team-name/flow-name",
      state: { __TSR_index: 0 },
      searchStr: "",
    });

    mockUseParams.mockReturnValue({
      team: "team-name",
      flow: "flow-name",
    });
  });

  afterAll(() => {
    setState({ previewEnvironment: "standalone" });
  });

  it("displays breadcrumbs", async () => {
    await setup(<Header />);
    expect(screen.getByText("Plan✕")).toBeInTheDocument();
    expect(screen.getByText(mockTeam1.slug)).toBeInTheDocument();
    expect(screen.getByText("test-flow")).toBeInTheDocument();
  });

  it("displays avatar and settings", async () => {
    await setup(<Header />);
    expect(screen.getByText("TU")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle Menu")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

for (const route of ["/published", "/preview", "/draft", "/pay", "/invite"]) {
  describe(`Header Component - ${route} Routes`, () => {
    beforeAll(() => {
      mockUseLocation.mockReturnValue({
        pathname: "/opensystemslab/test-flow" + route,
        search: {},
        hash: "",
        href: "/opensystemslab/test-flow" + route,
        state: { __TSR_index: 0 },
        searchStr: "",
      });

      mockUseParams.mockReturnValue({
        team: "opensystemslab",
        flow: "test-flow",
      });
    });

    it("displays a logo when available", async () => {
      await setup(<Header />);
      expect(screen.queryByText("Plan✕")).not.toBeInTheDocument();
      expect(screen.getByAltText(`${mockTeam1.name} Logo`)).toHaveAttribute(
        "src",
        "logo.jpg",
      );
    });

    it("falls back to the PlanX link when a logo is not present", async () => {
      act(() => setState({ teamTheme: mockTeam2.theme }));
      await setup(<Header />);
      expect(
        screen.queryByAltText(`${mockTeam2.name} Logo`),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Plan✕")).toBeInTheDocument();
      act(() => setState({ teamTheme: mockTeam1.theme }));
    });

    it("displays service title from the store", async () => {
      await setup(<Header />);
      act(() => setState({ flowName: "test flow" }));

      expect(screen.getByTestId("service-title")).toBeInTheDocument();
      expect(screen.getByText("test flow")).toBeInTheDocument();
    });

    it("should not have any accessibility violations", async () => {
      const { container } = await setup(<Header />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
}

describe("Section navigation bar", () => {
  beforeAll(() => {
    mockUseLocation.mockReturnValue({
      pathname: "/team-name/flow-name/published",
      search: {},
      hash: "",
      href: "/team-name/flow-name/published",
      state: { __TSR_index: 0 },
      searchStr: "",
    });

    mockUseParams.mockReturnValue({
      team: "team-name",
      flow: "flow-name",
    });
  });

  describe("Flow without sections", () => {
    it("does not display", async () => {
      await setup(<Header />);
      act(() => setState({ flow: flowWithoutSections }));
      act(() => getState().initNavigationStore());

      expect(screen.queryByTestId("navigation-bar")).not.toBeInTheDocument();
    });
  });

  describe("Flow with sections", () => {
    it("displays as expected", async () => {
      act(() => setState({ flow: flowWithThreeSections }));
      act(() => getState().initNavigationStore());
      await setup(<Header />);

      expect(screen.getByTestId("navigation-bar")).toBeInTheDocument();
    });

    it("display the correct information from the store", async () => {
      act(() => setState({ flow: flowWithThreeSections }));
      act(() => getState().initNavigationStore());
      await setup(<Header />);

      expect(screen.getByText("Section 1 of 3")).toBeInTheDocument();
      expect(screen.getByText("First section")).toBeInTheDocument();
    });

    it("should not have any accessibility violations", async () => {
      act(() => setState({ flow: flowWithThreeSections }));
      act(() => getState().initNavigationStore());
      const { container } = await setup(<Header />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
