import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { SectionNode, SectionStatus } from "types";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Section, { SectionsOverviewList, SectionsOverviewListProps } from ".";

describe("Section component", () => {
  it("renders correctly", () => {
    const handleSubmit = vi.fn();
    setup(
      <Section
        title="Section one"
        description="Description of section one"
        handleSubmit={handleSubmit}
        size={"medium"}
      />,
    );

    expect(screen.getByText("Application incomplete.")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("should not have any accessibility violations", async () => {
    const handleSubmit = vi.fn();

    const { container } = setup(
      <Section
        title="Section one"
        description="Description of section one"
        handleSubmit={handleSubmit}
        size="medium"
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("SectionsOverviewList component", () => {
  const mockSectionNodes: Record<string, SectionNode> = {
    section1: {
      type: 360,
      data: {
        title: "Section one",
        description: "Description of section one",
        size: "medium",
      },
    },
    section2: {
      type: 360,
      data: {
        title: "Section two",
        description: "Description of section two",
        size: "medium",
      },
    },
    section3: {
      type: 360,
      data: {
        title: "Section three",
        description: "Description of section three",
        size: "medium",
      },
    },
  };

  const defaultProps: SectionsOverviewListProps = {
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

  it("renders correctly", () => {
    setup(<SectionsOverviewList {...defaultProps} />);

    const sectionOneLink = screen.getByRole("link", {
      name: "Change Section one",
    });
    expect(sectionOneLink).toBeInTheDocument();
    expect(sectionOneLink).toHaveTextContent("Section one");

    expect(screen.getByText(SectionStatus.Completed)).toBeInTheDocument();

    expect(screen.getByText("Section two")).toBeInTheDocument();
    expect(screen.getByText(SectionStatus.ReadyToStart)).toBeInTheDocument();

    expect(screen.getByText("Section three")).toBeInTheDocument();
    expect(screen.getByText(SectionStatus.NotStarted)).toBeInTheDocument();
  });

  it("does not link section header text when showChange is false", () => {
    setup(<SectionsOverviewList {...defaultProps} showChange={false} />);

    expect(screen.getByText("Section one")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Change Section one" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Section one" }),
    ).not.toBeInTheDocument();
  });

  it("creates clickable links for completed sections when showChange is true", () => {
    const mockChangeAnswer = vi.fn();
    setup(
      <SectionsOverviewList
        {...defaultProps}
        changeAnswer={mockChangeAnswer}
      />,
    );

    const sectionOneLink = screen.getByRole("link", {
      name: "Change Section one",
    });
    expect(sectionOneLink).toBeInTheDocument();
    expect(sectionOneLink.getAttribute("href")).toBe("#");
    expect(sectionOneLink).toHaveTextContent("Section one");
  });

  it("creates clickable links for sections that are ready to start or continue", () => {
    const mockNextQuestion = vi.fn();
    setup(
      <SectionsOverviewList
        {...defaultProps}
        nextQuestion={mockNextQuestion}
      />,
    );

    const sectionTwoLink = screen.getByRole("link", { name: "Section two" });
    expect(sectionTwoLink).toBeInTheDocument();
    expect(sectionTwoLink.getAttribute("href")).toBe("#");
    expect(sectionTwoLink).toHaveTextContent("Section two");
  });

  it("does not create links for non-actionable sections", () => {
    setup(<SectionsOverviewList {...defaultProps} />);

    expect(screen.getByText("Section three")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Section three" }),
    ).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<SectionsOverviewList {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
