import { screen } from "@testing-library/react";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import FeedbackComponent from "../Public";

const handleSubmit = vi.fn();
vi.mock("lib/feedback", () => ({
  getInternalFeedbackMetadata: vi.fn(),
  insertFeedbackMutation: vi.fn(),
}));

vi.mock("hooks/usePublicRouteContext", () => ({
  usePublicRouteContext: vi.fn(() => "/$flow"),
}));

describe.each([
  {
    dataType: "a rating",
    expectedData: {
      feedbackScore: 1,
      feedbackType: "component",
      userComment: "",
    },
  },
  {
    dataType: "a comment",
    expectedData: {
      feedbackScore: "",
      feedbackType: "component",
      userComment: "I had a great time",
    },
  },
  {
    dataType: "nothing",
    expectedData: {
      feedbackScore: "",
      feedbackType: "component",
      userComment: "",
    },
  },
])(
  "when a user submits $dataType on a feedback component where feedback is not required",
  ({ dataType, expectedData }) => {
    beforeEach(async () => {
      const { user } = await setup(
        <FeedbackComponent
          handleSubmit={handleSubmit}
          feedbackRequired={false}
        />,
      );

      switch (dataType) {
        case "a rating":
          await user.click(screen.getByTestId("feedback-button-terrible"));

          break;
        case "a comment":
          await user.type(
            screen.getByTestId("user-comment"),
            "I had a great time",
          );
          break;
        case "nothing":
        default:
          break;
      }

      await user.click(screen.getByTestId("continue-button"));
    });

    it("should call the handleSubmit function with the correct data", async () => {
      expect(getInternalFeedbackMetadata).toHaveBeenCalled();
      expect(insertFeedbackMutation).toHaveBeenCalledWith(expectedData);
    });
  },
);

describe("when feedback is required but the user does not submit any data", async () => {
  beforeEach(async () => {
    const { user } = await setup(
      <FeedbackComponent handleSubmit={handleSubmit} feedbackRequired={true} />,
    );
    await user.click(screen.getByTestId("continue-button"));
  });

  it("displays an appropriate error message for each missing field", async () => {
    const errorMessages = [
      /Please rate your experience/,
      /Enter your feedback/,
    ];
    errorMessages.map((error) => {
      expect(screen.getByText(error)).toBeVisible();
    });
  });
});

describe("When the user presses to go back to the feedback component", () => {
  it("recovers the previously submitted answers", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <FeedbackComponent
        handleSubmit={handleSubmit}
        feedbackRequired={false}
        previouslySubmittedData={{
          data: {
            _feedback: {
              userComment: "I wrote this previously",
              feedbackScore: 2,
            },
          },
        }}
      />,
    );

    expect(screen.getByText("I wrote this previously")).toBeVisible();

    await user.click(screen.getByTestId("continue-button"));

    expect(insertFeedbackMutation).toHaveBeenCalledWith({
      feedbackScore: 2,
      feedbackType: "component",
      userComment: "I wrote this previously",
    });
  });
});
