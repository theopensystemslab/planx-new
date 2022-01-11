import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";
import waitForExpect from "wait-for-expect";

import Question from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <Question
      text="Best food"
      responses={[
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
      ]}
      handleSubmit={handleSubmit}
    />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Best food");

  await act(async () => {
    await userEvent.click(screen.getByText("Pizza"));

    await waitForExpect(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ answers: ["pizza_id"] });
    });
  });
});

it("should not have any accessibility violations", async () => {
  const handleSubmit = jest.fn();
  const { container } = render(
    <Question
      text="Best food"
      responses={[
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
      ]}
      handleSubmit={handleSubmit}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
