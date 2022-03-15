import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";
import waitForExpect from "wait-for-expect";

import Question, { IQuestion, QuestionLayout } from "./Public";

const responses: { [key in QuestionLayout]: IQuestion["responses"] } = {
  [QuestionLayout.Basic]: [
    {
      id: "pizza_id",
      responseKey: "pizza",
      title: "Pizza",
    },
    {
      id: "celery_id",
      responseKey: "celery",
      title: "Celery",
    },
  ],
  [QuestionLayout.Images]: [
    {
      id: "pizza_id",
      responseKey: "pizza",
      title: "Pizza",
      img: "pizza.jpg",
    },
    {
      id: "celery_id",
      responseKey: "celery",
      title: "Celery",
      img: "celery.jpg",
    },
  ],
  [QuestionLayout.Descriptions]: [
    {
      id: "pizza_id",
      responseKey: "pizza",
      title: "Pizza",
      description: "This is a pizza",
    },
    {
      id: "celery_id",
      responseKey: "celery",
      title: "Celery",
      description: "This is celery",
    },
  ],
};

describe("Question Component", () => {
  // TODO: Enable unit tests when "Description" questions are introduced
  [
    QuestionLayout.Basic,
    QuestionLayout.Images,
    // Layout.Descriptions
  ].forEach((type) => {
    it(`renders the ${QuestionLayout[type]} layout correctly`, async () => {
      const handleSubmit = jest.fn();

      render(
        <Question
          text="Best food"
          responses={responses[type]}
          handleSubmit={handleSubmit}
        />
      );

      const continueButton = screen.getByTestId("continue-button");

      expect(screen.getByRole("heading")).toHaveTextContent("Best food");

      await act(async () => {
        await waitForExpect(() => {
          expect(continueButton).toBeDisabled();
        });

        await userEvent.click(screen.getByText("Pizza"));

        await waitForExpect(() => {
          expect(continueButton).not.toBeDisabled();
        });

        await userEvent.click(continueButton);

        await waitForExpect(() => {
          expect(handleSubmit).toHaveBeenCalledWith({ answers: ["pizza_id"] });
        });
      });
    });

    it(`should not have any accessibility violations in the ${QuestionLayout[type]} layout`, async () => {
      const handleSubmit = jest.fn();
      const { container } = render(
        <Question
          text="Best food"
          responses={responses[type]}
          handleSubmit={handleSubmit}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
