import { act, waitFor } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { Store, useStore } from "pages/FlowEditor/lib/store";
import type { Question } from "./model";
import QuestionComponent, { QuestionLayout } from "./Public";

const { setState } = useStore;

// Setup a basic single component flow so that we're testing the "VisibleQuestion" throughout (eg wrapper checks `flow[props.id].edges`)
const flow: Store.Flow = {
  "_root": {
    "edges": [
      "qustion_id"
    ]
  },
  "celery_id": {
    "data": {
      "text": "celery"
    },
    "type": 200
  },
  "pizza_id": {
    "data": {
      "text": "pizza"
    },
    "type": 200
  },
  "question_id": {
    "data": {
      "text": "Best food",
    },
    "type": 100,
    "edges": [
      "pizza_id",
      "celery_id",
    ]
  },
};

beforeEach(() => {
  act(() => setState({ flow }));
});

const responses: { [key in QuestionLayout]: Question["responses"] } = {
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
        const handleSubmit = vi.fn();
        
        const { user, getByTestId, getByRole, getByText } = setup(
          <QuestionComponent
            id="question_id"
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
        const handleSubmit = vi.fn();
        const { user, getByRole, getByTestId } = setup(
          <QuestionComponent
            id="question_id"
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
        const handleSubmit = vi.fn();
        const { container } = setup(
          <QuestionComponent
            id="question_id"
            text="Best food"
            responses={responses[type]}
            handleSubmit={handleSubmit}
          />,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it(`should display an error message if no option is selected`, async () => {
        const handleSubmit = vi.fn();
        const errorMessage = /Select your answer before continuing/;

        const { user, getByTestId, getByText, queryByText } = setup(
          <QuestionComponent
            id="question_id"
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
