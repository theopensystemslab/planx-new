import { screen } from "@testing-library/react";
import React from "react";
import { axe, setup } from "testUtils";
import { SectionStatus } from "types";

import Section, { SectionsOverviewList } from "./Public";

describe("Section component", () => {
  it("renders correctly", () => {
    const handleSubmit = jest.fn();
    setup(
      <Section
        title="Section one"
        description="Description of section one"
        handleSubmit={handleSubmit}
      />,
    );

    expect(screen.getByText("Application incomplete.")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("should not have any accessibility violations", async () => {
    const handleSubmit = jest.fn();

    const { container } = setup(
      <Section
        title="Section one"
        description="Description of section one"
        handleSubmit={handleSubmit}
      />,
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
        description: "Description of section one",
      },
    },
    section2: {
      type: 360,
      data: {
        title: "Section two",
        description: "Description of section two",
      },
    },
    section3: {
      type: 360,
      data: {
        title: "Section three",
        description: "Description of section three",
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

  it("renders correctly", () => {
    setup(<SectionsOverviewList {...defaultProps} />);

    const changeLink = screen.getByText("Section one");
    expect(
      screen.getByRole("button", { name: "Change Section one" }),
    ).toContainElement(changeLink);
    expect(screen.getByText(SectionStatus.Completed)).toBeInTheDocument();

    expect(screen.getByText("Section two")).toBeInTheDocument();
    expect(screen.getByText(SectionStatus.ReadyToStart)).toBeInTheDocument();

    expect(screen.getByText("Section three")).toBeInTheDocument();
    expect(screen.getByText(SectionStatus.NotStarted)).toBeInTheDocument();
  });

  it("does not link section header text when showChange is false", () => {
    setup(<SectionsOverviewList {...defaultProps} showChange={false} />);

    expect(screen.getByText("Section one")).toBeInTheDocument();
    expect(screen.queryByText("Change Section one")).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<SectionsOverviewList {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
