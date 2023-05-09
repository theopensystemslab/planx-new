import { screen } from "@testing-library/react";
import { toggleFeatureFlag } from "lib/featureFlags";
import React from "react";
import { axe, setup } from "testUtils";
import { SectionStatus } from "types";

import Section, { SectionsOverviewList } from "./Public";

describe("Section component", () => {
  it("renders correctly when the NAVIGATION_UI feature flag is toggled off (default state)", () => {
    const handleSubmit = jest.fn();

    setup(<Section title="Section one" handleSubmit={handleSubmit} />);

    expect(
      screen.queryByText("Application incomplete.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Continue")).not.toBeInTheDocument();

    // handleSubmit is still called by useEffect to set auto = true so the Section isn't seen in card sequence
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("renders correctly when the NAVIGATION_UI feature flag is toggled on", () => {
    const handleSubmit = jest.fn();

    toggleFeatureFlag("NAVIGATION_UI");
    setup(<Section title="Section one" handleSubmit={handleSubmit} />);

    expect(screen.getByText("Application incomplete.")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("should not have any accessibility violations", async () => {
    const handleSubmit = jest.fn();

    toggleFeatureFlag("NAVIGATION_UI");
    const { container } = setup(
      <Section title="Section one" handleSubmit={handleSubmit} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("SectionsOverviewList component", () => {
  const mockSectionNodes = {
    section1: {
      type: 360,
      data: {
        title: "Section one",
      },
    },
    section2: {
      type: 360,
      data: {
        title: "Section two",
      },
    },
    section3: {
      type: 360,
      data: {
        title: "Section three",
      },
    },
  };
  const defaultProps = {
    flow: {
      _root: {
        edges: ["section1", "section2", "section3"],
      },
      ...mockSectionNodes,
    },
    sectionNodes: mockSectionNodes,
    showChange: true,
    changeAnswer: () => {},
    nextQuestion: () => {},
    isReconciliation: false,
    currentCard: null,
    breadcrumbs: {
      section1: {
        auto: false,
      },
      firstQuestion: {
        auto: false,
        answers: ["firstAnswer"],
      },
      secondSection: {
        auto: false,
      },
    },
  };

  it("renders correctly when the NAVIGATION_UI feature flag is toggled on", () => {
    setup(<SectionsOverviewList {...defaultProps} />);

    expect(screen.getByText("Section one")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Section one");
    expect(screen.getByText(SectionStatus.Completed)).toBeInTheDocument();

    expect(screen.getByText("Section two")).toBeInTheDocument();
    expect(screen.getByText(SectionStatus.ReadyToStart)).toBeInTheDocument();

    expect(screen.getByText("Section three")).toBeInTheDocument();
    expect(screen.getByText(SectionStatus.NotStarted)).toBeInTheDocument();
  });

  it("does not link section header text when showChange is false", () => {
    toggleFeatureFlag("NAVIGATION_UI");
    setup(<SectionsOverviewList {...defaultProps} showChange={false} />);

    expect(screen.getByText("Section one")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should not have any accessiblity violations", async () => {
    toggleFeatureFlag("NAVIGATION_UI");
    const { container } = setup(<SectionsOverviewList {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
