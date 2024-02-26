import React from "react";
import { axe, setup } from "testUtils";

import FeedbackPhaseBanner from "./FeedbackPhaseBanner";

describe("FeedbackPhaseBanner presentation and functionality", () => {
  const handleFeedbackClick = jest.fn();
  const handleReportAnIssueClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders PUBLIC BETA flag and buttons correctly", () => {
    const { getByText } = setup(
      <FeedbackPhaseBanner
        handleFeedbackClick={handleFeedbackClick}
        handleReportAnIssueClick={handleReportAnIssueClick}
      />,
    );

    expect(getByText("PUBLIC BETA")).toBeInTheDocument();
    expect(getByText("Report an issue with this page")).toBeInTheDocument();
    expect(getByText("feedback")).toBeInTheDocument();
  });

  test("clicking on feedback link calls handleFeedbackClick", async () => {
    const { getByText, user } = setup(
      <FeedbackPhaseBanner
        handleFeedbackClick={handleFeedbackClick}
        handleReportAnIssueClick={handleReportAnIssueClick}
      />,
    );

    await user.click(getByText("feedback"));
    expect(handleFeedbackClick).toHaveBeenCalledTimes(1);
  });

  test("clicking on 'Report an issue with this page' button calls handleReportAnIssueClick", async () => {
    const { getByText, user } = setup(
      <FeedbackPhaseBanner
        handleFeedbackClick={handleFeedbackClick}
        handleReportAnIssueClick={handleReportAnIssueClick}
      />,
    );

    await user.click(getByText("Report an issue with this page"));
    expect(handleReportAnIssueClick).toHaveBeenCalledTimes(1);
  });
});

describe("FeedbackPhaseBanner accessibility", () => {
  test("should have no accessibility violations", async () => {
    const { container } = setup(
      <FeedbackPhaseBanner
        handleFeedbackClick={() => {}}
        handleReportAnIssueClick={() => {}}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
