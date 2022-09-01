import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";

import Review from "./Public/Presentational";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={{}}
      breadcrumbs={{}}
      passport={{}}
      changeAnswer={() => {}}
      handleSubmit={handleSubmit}
      showChangeButton={true}
    />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Review");

  await userEvent.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("REGRESSION: doesn't return undefined when multiple nodes are filled", async () => {
  const handleSubmit = jest.fn();

  render(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={mockedFlow}
      breadcrumbs={mockedBreadcrumbs}
      passport={mockedPassport}
      changeAnswer={() => {}}
      handleSubmit={handleSubmit}
      showChangeButton={true}
    />
  );

  expect(screen.getByText("This is a text")).toBeTruthy();
  expect(screen.getByText("356")).toBeTruthy();
  expect(screen.getByText("Option 2")).toBeTruthy();
  expect(screen.queryAllByText("undefined")).toHaveLength(0);
});

const mockedBreadcrumbs = {
  ZM31xEWH2c: {
    auto: false,
    data: {
      ZM31xEWH2c: 356,
    },
  },
  "1A14DTRw0d": {
    auto: false,
    data: {
      "1A14DTRw0d": "This is a text",
    },
  },
  duzkfXlWGn: {
    auto: false,
    answers: ["iWvI9QkgIT"],
  },
};
const mockedPassport = {
  data: {
    ZM31xEWH2c: 356,
    "1A14DTRw0d": "This is a text",
  },
};
const mockedFlow = {
  _root: { edges: ["ZM31xEWH2c", "1A14DTRw0d", "duzkfXlWGn", "EJBY2zSbmL"] },
  "1A14DTRw0d": { data: { title: "Input a text" }, type: 110 },
  EJBY2zSbmL: { type: 600 },
  ZM31xEWH2c: { data: { title: "Input a number" }, type: 150 },
  duzkfXlWGn: {
    data: { text: "Select the desired options", allRequired: false },
    type: 105,
    edges: ["ky2QQWHgi5", "iWvI9QkgIT", "nyYCBQs24s"],
  },
  iWvI9QkgIT: { data: { text: "Option 2" }, type: 200 },
  ky2QQWHgi5: { data: { text: "Option 1" }, type: 200 },
  nyYCBQs24s: { data: { text: "Option 3" }, type: 200 },
};

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={mockedFlow}
      breadcrumbs={mockedBreadcrumbs}
      passport={mockedPassport}
      changeAnswer={() => {}}
      showChangeButton={true}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
