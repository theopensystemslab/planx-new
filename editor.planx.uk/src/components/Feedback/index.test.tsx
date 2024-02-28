import { Breadcrumbs } from "@opensystemslab/planx-core/types";
import { act, waitFor } from "@testing-library/react";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import { vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { axe, setup } from "testUtils";

import Feedback from "./index";

const { setState } = vanillaStore;

const mockedBreadcrumbs: Breadcrumbs = {
  LU5xin8PHs: {
    answers: ["xuFhs3Hqr9"],
    auto: false,
  },
};

jest.mock("lib/feedback", () => ({
  getInternalFeedbackMetadata: jest.fn(),
  insertFeedbackMutation: jest.fn(),
}));

const scrollIntoViewMock = jest.fn();
window.Element.prototype.scrollIntoView = scrollIntoViewMock;

describe("Feedback component triage journey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Initial render shows the FeedbackPhaseBannerView but doesn't scroll into view", () => {
    const { getByText } = setup(<Feedback />);

    expect(getByText("PUBLIC BETA")).toBeInTheDocument();
    expect(getByText("Report an issue with this page")).toBeInTheDocument();
    expect(getByText("feedback")).toBeInTheDocument();
    expect(scrollIntoViewMock).not.toBeCalled();
  });

  test("Selecting 'feedback' scrolls triage into view", async () => {
    const { getByText, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));

    expect(scrollIntoViewMock).toBeCalledTimes(1);

    await waitFor(() => {
      expect(getByRole("button", { name: "Issue" })).toBeInTheDocument();
      expect(getByRole("button", { name: "Idea" })).toBeInTheDocument();
      expect(getByRole("button", { name: "Comment" })).toBeInTheDocument();
    });
  });

  test("Selecting 'Issue' from triage scrolls the issue form into view", async () => {
    const { getByLabelText, getByText, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));
    await user.click(getByRole("button", { name: "Issue" }));

    expect(scrollIntoViewMock).toBeCalledTimes(2);

    await waitFor(() => {
      expect(getByLabelText("What were you doing?")).toBeInTheDocument();
      expect(getByLabelText("What went wrong?")).toBeInTheDocument();
    });
  });

  test("Submitting 'Report an Issue' form changes view to thank you message", async () => {
    const { getByText, getByLabelText, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));
    await user.click(getByRole("button", { name: "Issue" }));

    await waitFor(() => {
      expect(getByLabelText("What went wrong?")).toBeInTheDocument();
    });

    await user.type(getByLabelText("What were you doing?"), "Testing feedback");
    await user.type(getByLabelText("What went wrong?"), "Found a bug");

    await user.click(getByText("Send feedback"));

    await waitFor(() => {
      expect(getInternalFeedbackMetadata).toBeCalledTimes(1);
      expect(insertFeedbackMutation).toBeCalledTimes(1);
      expect(getByText("Thank you for your feedback.")).toBeInTheDocument();
    });
  });

  test("Selecting 'Idea' from triage scrolls the idea form into view", async () => {
    const { getByText, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));
    await user.click(getByRole("button", { name: "Idea" }));

    expect(scrollIntoViewMock).toBeCalledTimes(2);

    await waitFor(() => {
      expect(getByText("Share an idea")).toBeInTheDocument();
    });
  });

  test("Submitting 'Share an idea' form changes view to thank you message", async () => {
    const { getByText, getByTestId, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));
    await user.click(getByRole("button", { name: "Idea" }));

    await waitFor(() => {});
    expect(getByText("Share an idea")).toBeInTheDocument();

    await user.type(getByTestId("userCommentTextarea"), "What about 3D maps");

    await user.click(getByText("Send feedback"));

    await waitFor(() => {
      expect(getInternalFeedbackMetadata).toBeCalledTimes(1);
      expect(insertFeedbackMutation).toBeCalledTimes(1);
      expect(getByText("Thank you for your feedback.")).toBeInTheDocument();
    });
  });

  test("Selecting 'Comment' from triage scrolls the comment form into view", async () => {
    const { getByText, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));
    await user.click(getByRole("button", { name: "Comment" }));

    expect(scrollIntoViewMock).toBeCalledTimes(2);

    await waitFor(() => {
      expect(getByText("Share a comment")).toBeInTheDocument();
    });
  });

  test("Submitting 'Share a comment' form changes view to thank you message", async () => {
    const { getByText, getByTestId, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));
    await user.click(getByRole("button", { name: "Comment" }));

    await waitFor(() => {
      expect(getByText("Share a comment")).toBeInTheDocument();
    });

    await user.type(getByTestId("userCommentTextarea"), "This page is great");

    await user.click(getByText("Send feedback"));

    await waitFor(() => {
      expect(getInternalFeedbackMetadata).toBeCalledTimes(1);
      expect(insertFeedbackMutation).toBeCalledTimes(1);
      expect(getByText("Thank you for your feedback.")).toBeInTheDocument();
    });
  });
});

describe("Feedback component 'Report an issue with this page journey'", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Selecting 'Report an issue with this page journey' directly scrolls the issue form variation into view", async () => {
    const { getByText, getByLabelText, user } = setup(<Feedback />);

    await user.click(getByText("Report an issue with this page"));

    expect(scrollIntoViewMock).toBeCalledTimes(1);

    await waitFor(() => {
      expect(getByText("Report an issue")).toBeInTheDocument();
      expect(getByLabelText("What were you doing?")).toBeInTheDocument();
      expect(getByLabelText("What went wrong?")).toBeInTheDocument();
    });
  });

  test("Submitting directly opened 'Report an issue' form changes to 'Thank you' view", async () => {
    const { getByText, getByLabelText, user } = setup(<Feedback />);

    await user.click(getByText("Report an issue with this page"));

    expect(scrollIntoViewMock).toBeCalledTimes(1);

    await waitFor(() => {
      expect(getByLabelText("What were you doing?")).toBeInTheDocument();
    });

    await user.type(getByLabelText("What were you doing?"), "Testing feedback");
    await user.type(getByLabelText("What went wrong?"), "Found a bug");

    await user.click(getByText("Send feedback"));

    await waitFor(() => {
      expect(getInternalFeedbackMetadata).toBeCalledTimes(1);
      expect(insertFeedbackMutation).toBeCalledTimes(1);
      expect(getByText("Thank you for your feedback.")).toBeInTheDocument();
    });
  });
});

describe("Feedback view changes with breadcrumbs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("If breadcrumbs change and the view was thank you it resets to banner", async () => {
    const { getByText, getByTestId, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));
    await user.click(getByRole("button", { name: "Idea" }));

    await waitFor(() => {
      expect(getByText("Share an idea")).toBeInTheDocument();
    });

    await user.type(getByTestId("userCommentTextarea"), "What about 3D maps");

    await user.click(getByText("Send feedback"));

    await waitFor(() => {
      expect(getByText("Thank you for your feedback.")).toBeInTheDocument();
    });

    act(() => setState({ breadcrumbs: mockedBreadcrumbs }));

    await waitFor(() => {
      expect(getByText("PUBLIC BETA")).toBeInTheDocument();
      expect(getByText("Report an issue with this page")).toBeInTheDocument();
      expect(getByText("feedback")).toBeInTheDocument();
    });
  });

  test("If breadcrumbs change and the view was not 'thank you' it doesn't reset to banner", async () => {
    const { getByText, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));
    await user.click(getByRole("button", { name: "Idea" }));

    await waitFor(() => {
      expect(getByText("Share an idea")).toBeInTheDocument();
    });

    act(() => setState({ breadcrumbs: mockedBreadcrumbs }));

    await waitFor(() => {
      expect(getByText("Share an idea")).toBeInTheDocument();
    });
  });
});

describe("Feedback component accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Initial load should have no accessibility violations", async () => {
    const { container } = setup(<Feedback />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Direct to Issue form view should have no accessibility violations", async () => {
    const { container, getByText, user } = setup(<Feedback />);
    await user.click(getByText("Report an issue with this page"));

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Triage view should have no accessibility violations", async () => {
    const { container, getByText, getByRole, user } = setup(<Feedback />);

    user.click(getByText("feedback"));

    await waitFor(() => {
      expect(getByRole("button", { name: "Idea" })).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Issue form via triage should have no accessibility violations", async () => {
    const { container, getByText, getByLabelText, getByRole, user } = setup(
      <Feedback />,
    );

    await user.click(getByText("feedback"));

    await waitFor(() => {
      expect(getByRole("button", { name: "Issue" })).toBeInTheDocument();
    });

    await user.click(getByRole("button", { name: "Issue" }));

    await waitFor(() => {
      expect(getByLabelText("What were you doing?")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Idea form should have no accessibility violations", async () => {
    const { container, getByText, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));

    await waitFor(() => {
      expect(getByRole("button", { name: "Idea" })).toBeInTheDocument();
    });

    await user.click(getByRole("button", { name: "Idea" }));

    await waitFor(() => {
      expect(getByText("Share an idea")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Comment form should have no accessibility violations", async () => {
    const { container, getByText, getByRole, user } = setup(<Feedback />);

    await user.click(getByText("feedback"));

    await waitFor(() => {
      expect(getByRole("button", { name: "Comment" })).toBeInTheDocument();
    });

    await user.click(getByRole("button", { name: "Comment" }));

    await waitFor(() => {
      expect(getByText("Share a comment")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Thank you view should have no accessibility violations", async () => {
    const { container, getByLabelText, getByText, user } = setup(<Feedback />);

    await user.click(getByText("Report an issue with this page"));

    await user.type(
      getByLabelText("What were you doing?"),
      "Answering a question",
    );
    await user.type(
      getByLabelText("What went wrong?"),
      "I couldn't select Continue",
    );

    await user.click(getByText("Send feedback"));

    await waitFor(() => {
      expect(getByText("Thank you for your feedback.")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
