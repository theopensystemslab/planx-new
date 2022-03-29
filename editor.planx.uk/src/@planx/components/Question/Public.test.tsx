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

it("renders correctly with responses containing comments", async () => {
  const handleSubmit = jest.fn();

  render(
    <Question
      handleSubmit={handleSubmit}
      responses={responsesWithComment}
      text="Question"
    />
  );

  expect(screen.getAllByTestId("description-button")).toHaveLength(3);
  expect(screen.getByText("Some description")).toBeInTheDocument();

  await act(async () => {
    userEvent.click(screen.getByText("Commented"));
  });

  await act(async () => {
    userEvent.click(screen.getByText("Continue"));

    await waitForExpect(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ answers: ["option1"] });
    });
  });
});

it("renders correctly with responses containing images", async () => {
  const handleSubmit = jest.fn();

  render(
    <Question
      handleSubmit={handleSubmit}
      responses={responsesWithImages}
      text="Question"
    />
  );

  expect(screen.getAllByTestId("image-button")).toHaveLength(3);
  expect(screen.getByText("Some description")).toBeInTheDocument();

  await act(async () => {
    userEvent.click(screen.getByText("Without image"));
  });

  await act(async () => {
    userEvent.click(screen.getByText("Continue"));

    await waitForExpect(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ answers: ["image2"] });
    });
  });
});

const responsesWithComment = [
  {
    id: "option1",
    responseKey: 1,
    title: "Commented",
    text: "Commented",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  },
  {
    id: "option2",
    responseKey: 2,
    title: "No comment",
    description:
      "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    text: "No comment",
  },
  {
    id: "option3",
    responseKey: 3,
    title: "No Comment 2",
    text: "No Comment 2",
    description: "Some description",
  },
];

const responsesWithImages = [
  {
    id: "image1",
    responseKey: 1,
    title: "Image",
    img: "https://planx-temp.s3.eu-west-2.amazonaws.com/2qp7swtk/fut.email.png",
    text: "Image",
    description: "Description",
  },
  {
    id: "image2",
    responseKey: 2,
    title: "Without image",
    text: "Without image",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
  },
  {
    id: "image3",
    responseKey: 3,
    title: "Without image 2",
    text: "Without image 2",
    description: "Some description",
  },
];
