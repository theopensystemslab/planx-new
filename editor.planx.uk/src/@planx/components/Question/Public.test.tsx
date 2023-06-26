import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { axe, setup } from "testUtils";

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
describe("Question component", () => {
  [
    QuestionLayout.Basic,
    QuestionLayout.Images,
    QuestionLayout.Descriptions,
  ].forEach((type) => {
    it(`renders the ${QuestionLayout[type]} layout correctly`, async () => {
      const handleSubmit = jest.fn();

      const { user } = setup(
        <Question
          text="Best food"
          responses={responses[type]}
          handleSubmit={handleSubmit}
        />
      );

      const continueButton = screen.getByTestId("continue-button");

      expect(screen.getByRole("heading")).toHaveTextContent("Best food");

      expect(continueButton).toBeDisabled();

      await user.click(screen.getByText("Pizza"));

      expect(continueButton).not.toBeDisabled();

      await user.click(continueButton);

      await waitFor(() =>
        expect(handleSubmit).toHaveBeenCalledWith({ answers: ["pizza_id"] })
      );
    });

    it(`should display previously selected answer on back or change in the ${QuestionLayout[type]} layout`, async () => {
      const handleSubmit = jest.fn();
      const { user } = setup(
        <Question
          text="Best food"
          responses={responses[type]}
          previouslySubmittedData={{
            answers: ["celery_id"],
            auto: false,
          }}
          handleSubmit={handleSubmit}
        />
      );

      expect(screen.getByRole("heading")).toHaveTextContent("Best food");

      let celeryRadio: HTMLElement | undefined;
      if (QuestionLayout[type] === "Basic") {
        celeryRadio = screen.getByRole("radio", { name: "Celery" });
      } else if (QuestionLayout[type] === "Descriptions") {
        celeryRadio = screen.getByRole("radio", {
          name: "Celery This is celery",
        });
      } else if (QuestionLayout[type] === "Images") {
        celeryRadio = screen.getByRole("radio", { name: "Celery Celery" });
      }
      expect(celeryRadio).toBeChecked();

      const continueButton = screen.getByTestId("continue-button");
      expect(continueButton).toBeEnabled();
    });

    it(`should not have any accessibility violations in the ${QuestionLayout[type]} layout`, async () => {
      const handleSubmit = jest.fn();
      const { container } = setup(
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
