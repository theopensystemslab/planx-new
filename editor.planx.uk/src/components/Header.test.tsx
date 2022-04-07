import { render, screen } from "@testing-library/react";
import axe from "axe-helper";
import React from "react";
import * as ReactNavi from "react-navi";
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
    render(<Header variant={HeaderVariant.Editor} team={mockTeam1}></Header>);
    expect(screen.getByText("Plan✕")).toBeInTheDocument();
    expect(screen.getByText(mockTeam1.slug)).toBeInTheDocument();
    expect(screen.getByText("test-flow")).toBeInTheDocument();
  });

  it("displays avatar and settings", () => {
    render(<Header variant={HeaderVariant.Editor} team={mockTeam1}></Header>);
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle Menu")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = render(
      <Header variant={HeaderVariant.Editor} team={mockTeam1}></Header>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Header Component - Public Routes", () => {
  it("displays a logo when available", () => {
    render(<Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>);
    expect(screen.queryByText("Plan✕")).not.toBeInTheDocument();
    expect(screen.getByAltText(`${mockTeam1.name} Logo`)).toHaveAttribute(
      "src",
      "logo.jpg"
    );
  });

  it("falls back to the PlanX link when a logo is not present", () => {
    render(<Header variant={HeaderVariant.Preview} team={mockTeam2}></Header>);
    expect(
      screen.queryByAltText(`${mockTeam2.name} Logo`)
    ).not.toBeInTheDocument();
    expect(screen.getByText("Plan✕")).toBeInTheDocument();
  });

  it("parses the url pathname and displays a service title", () => {
    render(<Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>);
    expect(screen.getByTestId("service-title")).toBeInTheDocument;
    expect(screen.getByText("test flow")).toBeInTheDocument;
  });

  it("should not have any accessibility violations", async () => {
    const { container } = render(
      <Header variant={HeaderVariant.Preview} team={mockTeam1}></Header>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
