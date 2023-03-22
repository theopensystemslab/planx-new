import { screen } from "@testing-library/react";
import { toggleFeatureFlag } from "lib/featureFlags";
import { SectionStatus } from "pages/FlowEditor/lib/store/navigation";
import React from "react";
import { axe, setup } from "testUtils";

import Section, { SectionsOverviewList } from "./Public";

describe("Section component", () => {
  it("renders correctly when the NAVIGATION_UI feature flag is toggled off (default state)", () => {
    const handleSubmit = jest.fn();

    setup(<Section title="Section one" handleSubmit={handleSubmit} />);

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
  const mockSectionStatuses = {
    section1: SectionStatus.Completed,
    section2: SectionStatus.InProgress,
    section3: SectionStatus.NotStarted,
  };

  it("renders correctly when the NAVIGATION_UI feature flag is toggled on", () => {
    toggleFeatureFlag("NAVIGATION_UI");
    setup(
      <SectionsOverviewList
        sectionNodes={mockSectionNodes}
        sectionStatuses={mockSectionStatuses}
        showChange={true}
      />
    );

    expect(screen.getByText("Section one")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Section one");
    expect(screen.getByText(SectionStatus.Completed)).toBeInTheDocument();

    expect(screen.getByText("Section two")).toBeInTheDocument();
    expect(screen.getByText(SectionStatus.InProgress)).toBeInTheDocument();

    expect(screen.getByText("Section three")).toBeInTheDocument();
    expect(screen.getByText(SectionStatus.NotStarted)).toBeInTheDocument();
  });

  it("should not have any accessiblity violations", async () => {
    toggleFeatureFlag("NAVIGATION_UI");
    const { container } = setup(
      <SectionsOverviewList
        sectionNodes={mockSectionNodes}
        sectionStatuses={mockSectionStatuses}
        showChange={true}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
