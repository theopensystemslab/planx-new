import { waitFor } from "@testing-library/react";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import MoreInfoFeedbackComponent from "./MoreInfoFeedback";

vi.mock("lib/feedback", () => {
  return {
    getInternalFeedbackMetadata: vi.fn(),
    insertFeedbackMutation: vi.fn(),
  };
});

vi.mock("hooks/usePublicRouteContext", () => ({
  usePublicRouteContext: vi.fn(() => "/$flow"),
}));

const scrollIntoView = vi.fn();
window.Element.prototype.scrollIntoView = scrollIntoView;

describe("MoreInfoFeedbackComponent presentation and functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Initial load
  test('Initial loads renders "Yes" and "No" buttons initially', async () => {
    const { getByText } = await setup(<MoreInfoFeedbackComponent />);
    expect(getByText("Yes")).toBeInTheDocument();
    expect(getByText("No")).toBeInTheDocument();
  });

  test("Does not scroll into view on initial render", async () => {
    await setup(<MoreInfoFeedbackComponent />);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  // Sentiment selection
  test("Clicking Yes input form scrolls into view", async () => {
    const { getByText, user } = await setup(<MoreInfoFeedbackComponent />);
    await user.click(getByText("Yes"));
    expect(scrollIntoView).toHaveBeenCalled();
    await waitFor(() => {
      expect(
        getByText("Please help us to improve this service by sharing feedback"),
      ).toBeInTheDocument();
    });
  });

  test("Clicking No input form scrolls into view", async () => {
    const { getByText, user } = await setup(<MoreInfoFeedbackComponent />);

    await user.click(getByText("No"));
    expect(scrollIntoView).toHaveBeenCalled();
    await waitFor(() => {
      expect(
        getByText("Please help us to improve this service by sharing feedback"),
      ).toBeInTheDocument();
    });
  });

  // Form submission
  test("Submitting feedback changes view to thank you message", async () => {
    const { getByText, getByTestId, user } = await setup(
      <MoreInfoFeedbackComponent />,
    );

    user.click(getByText("Yes"));
    await waitFor(() => {
      expect(getByTestId("userCommentTextarea")).toBeInTheDocument();
    });

    await user.type(getByTestId("userCommentTextarea"), "Great help, thanks!");

    user.click(getByText("Send feedback"));
    await waitFor(() => {
      expect(getInternalFeedbackMetadata).toHaveBeenCalled();
      expect(insertFeedbackMutation).toHaveBeenCalled();
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
    const { getByLabelText, queryByLabelText, getByText, user } = await setup(
      <MoreInfoFeedbackComponent />,
    );

    expect(queryByLabelText("What's your feedback?")).not.toBeInTheDocument();

    user.click(getByText("Yes"));

    await waitFor(() =>
      expect(getByLabelText("What's your feedback?")).toBeInTheDocument(),
    );

    expect(getByLabelText("What's your feedback?")).toBeRequired();
  });
});

describe("MoreInfoFeedbackComponent accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Initial load should have no accessibility violations", async () => {
    const { container } = await setup(<MoreInfoFeedbackComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Form view should have no accessability violations", async () => {
    const { container, getByText, user } = await setup(
      <MoreInfoFeedbackComponent />,
    );
    user.click(getByText("Yes"));

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Thank you view should have no accessibility violations", async () => {
    const { container, getByText, getByTestId, user } = await setup(
      <MoreInfoFeedbackComponent />,
    );

    user.click(getByText("Yes"));
    await waitFor(() => {
      expect(getByTestId("userCommentTextarea")).toBeInTheDocument();
    });

    await user.type(getByTestId("userCommentTextarea"), "Great help, thanks!");

    user.click(getByText("Send feedback"));

    await waitFor(() => {
      expect(getByText("Thank you for your feedback.")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
