import "@testing-library/jest-dom/extend-expect";

import { fireEvent, waitFor } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import userEvent from "@testing-library/user-event";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import React from "react";
import { axe, setup } from "testUtils";

import MoreInfoFeedbackComponent from "./MoreInfoFeedback";

jest.mock("lib/feedback", () => {
  return {
    getInternalFeedbackMetadata: jest.fn(),
    insertFeedbackMutation: jest.fn(),
  };
});

const scrollIntoView = jest.fn();
window.Element.prototype.scrollIntoView = scrollIntoView;

describe("MoreInfoFeedbackComponent presentation and functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Initial load
  test('Initial loads renders "Yes" and "No" buttons initially', () => {
    const { getByText } = setup(<MoreInfoFeedbackComponent />);
    expect(getByText("Yes")).toBeInTheDocument();
    expect(getByText("No")).toBeInTheDocument();
  });

  test("Does not scroll into view on initial render", () => {
    setup(<MoreInfoFeedbackComponent />);
    expect(scrollIntoView).not.toBeCalled();
  });

  // Sentiment selection
  test("Clicking Yes input form scrolls into view", async () => {
    const { getByText } = setup(<MoreInfoFeedbackComponent />);
    fireEvent.click(getByText("Yes"));
    expect(scrollIntoView).toBeCalled();
    await waitFor(() => {
      expect(
        getByText("Please help us to improve this service by sharing feedback"),
      ).toBeInTheDocument();
    });
  });

  test("Clicking No input form scrolls into view", async () => {
    const { getByText } = setup(<MoreInfoFeedbackComponent />);
    fireEvent.click(getByText("No"));
    expect(scrollIntoView).toBeCalled();
    await waitFor(() => {
      expect(
        getByText("Please help us to improve this service by sharing feedback"),
      ).toBeInTheDocument();
    });
  });

  // Form submission
  test("Submitting feedback changes view to thank you message", async () => {
    const { getByText, getByTestId } = setup(<MoreInfoFeedbackComponent />);

    fireEvent.click(getByText("Yes"));
    await waitFor(() => {
      expect(getByTestId("userCommentTextarea")).toBeInTheDocument();
    });

    await userEvent.type(
      getByTestId("userCommentTextarea"),
      "Great help, thanks!",
    );

    fireEvent.click(getByText("Send feedback"));
    await waitFor(() => {
      expect(getInternalFeedbackMetadata).toBeCalled();
      expect(insertFeedbackMutation).toBeCalled();
    });

    await waitFor(() => {
      expect(getByText("Thank you for your feedback.")).toBeInTheDocument();
    });
  });

  /*
    We use the `required` property to validate that a user can't submit an empty
    comment. 
    
    It doesn't seem to be possible to test that the Browser stops form
    submit in the Jest environment.
    
    Checking for `required` property currently but we could add explicit
    validation.
  */
  test("Feedback form requires a comment before submitting", async () => {
    const { getByTestId, getByText } = setup(<MoreInfoFeedbackComponent />);

    fireEvent.click(getByText("Yes"));
    await waitFor(() => {
      expect(getByTestId("userCommentTextarea")).toBeInTheDocument();
    });

    expect(getByTestId("userCommentTextarea")).toHaveAttribute("required");
  });
});

describe("MoreInfoFeedbackComponent accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Initial load should have no accessibility violations", async () => {
    const { container } = setup(<MoreInfoFeedbackComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Form view should have no accessability violations", async () => {
    const { container, getByText } = setup(<MoreInfoFeedbackComponent />);
    fireEvent.click(getByText("Yes"));

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Thank you view should have no accessibility violations", async () => {
    const { container, getByText, getByTestId } = setup(
      <MoreInfoFeedbackComponent />,
    );

    fireEvent.click(getByText("Yes"));
    await waitFor(() => {
      expect(getByTestId("userCommentTextarea")).toBeInTheDocument();
    });

    await userEvent.type(
      getByTestId("userCommentTextarea"),
      "Great help, thanks!",
    );

    fireEvent.click(getByText("Send feedback"));

    await waitFor(() => {
      expect(getByText("Thank you for your feedback.")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
