import { screen } from "@testing-library/react";
import { vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import * as ReactNavi from "react-navi";
import { axe, setup } from "testUtils";
import { Team } from "types";

import Header, { HeaderVariant } from "./Header";

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
    const { setState } = vanillaStore;
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
});
