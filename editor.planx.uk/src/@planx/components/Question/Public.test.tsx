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
    describe(`${QuestionLayout[type]} layout`, () => {
      it(`renders the layout correctly`, async () => {
        const handleSubmit = jest.fn();

        const { user, getByTestId, getByRole, getByText } = setup(
          <Question
            text="Best food"
            responses={responses[type]}
            handleSubmit={handleSubmit}
          />,
        );

        const continueButton = getByTestId("continue-button");

        expect(getByRole("heading")).toHaveTextContent("Best food");

        await user.click(getByText("Pizza"));

        await user.click(continueButton);

        await waitFor(() =>
          expect(handleSubmit).toHaveBeenCalledWith({ answers: ["pizza_id"] }),
        );
      });

      it(`should display previously selected answer on back or change`, async () => {
        const handleSubmit = jest.fn();
        const { user, getByRole, getByTestId } = setup(
          <Question
            text="Best food"
            responses={responses[type]}
            previouslySubmittedData={{
              answers: ["celery_id"],
              auto: false,
            }}
            handleSubmit={handleSubmit}
          />,
        );

        expect(getByRole("heading")).toHaveTextContent("Best food");

        const celeryRadio = getByRole("radio", { name: /Celery/ });
        const pizzaRadio = getByRole("radio", { name: /Pizza/ });

        // State is preserved...
        expect(celeryRadio).toBeChecked();

        // ...and can be updated
        await user.click(pizzaRadio);
        expect(pizzaRadio).toBeChecked();

        const continueButton = getByTestId("continue-button");
        expect(continueButton).toBeEnabled();
      });

      it(`should not have any accessibility violations`, async () => {
        const handleSubmit = jest.fn();
        const { container } = setup(
          <Question
            text="Best food"
            responses={responses[type]}
            handleSubmit={handleSubmit}
          />,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it(`should display an error message if no option is selected`, async () => {
        const handleSubmit = jest.fn();
        const errorMessage = /Select your answer before continuing/;

        const { user, getByTestId, getByText, queryByText } = setup(
          <Question
            text="Best food"
            responses={responses[type]}
            handleSubmit={handleSubmit}
          />,
        );

        const continueButton = getByTestId("continue-button");

        expect(continueButton).not.toBeDisabled();
        expect(queryByText(errorMessage)).not.toBeInTheDocument();

        await user.click(continueButton);

        await waitFor(() => {
          expect(handleSubmit).not.toHaveBeenCalled();
          expect(getByText(errorMessage)).toBeVisible();
        });
      });
    });
  });
});
