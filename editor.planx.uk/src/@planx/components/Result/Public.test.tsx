import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";

import Result from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <Result
      headingColor={{ text: "#000", background: "#fff" }}
      responses={[]}
      handleSubmit={handleSubmit}
      headingTitle="AMAZING"
    />
  );

  expect(screen.getAllByRole("heading")[0]).toHaveTextContent("AMAZING");

  await act(async () => {
    await userEvent.click(screen.getByText("Continue"));
  });
  expect(handleSubmit).toHaveBeenCalled();
});

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <Result
      headingColor={{ text: "#000", background: "#fff" }}
      responses={[]}
      headingTitle="title"
      reasonsTitle="reasons"
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

describe("showing and hiding change capabilities", () => {
  it("hides the change button by default", () => {
    render(
      <Result
        responses={[
          {
            question: { data: { text: "How's the weather?" }, id: "a" },
            hidden: false,
            selections: [],
          },
        ]}
        handleSubmit={() => {}}
        headingColor={{ text: "pink", background: "white" }}
      />
    );

    expect(screen.queryByText("Change")).toBeFalsy();
  });

  it("shows the change button when allowChanges is true", () => {
    render(
      <Result
        responses={[
          {
            question: { data: { text: "How's the weather?" }, id: "a" },
            hidden: false,
            selections: [],
          },
        ]}
        handleSubmit={() => {}}
        headingColor={{ text: "pink", background: "white" }}
        allowChanges={true}
      />
    );

    expect(screen.queryByText("Change")).toBeTruthy();
  });
});

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <Result
      headingColor={{ text: "#000", background: "#fff" }}
      responses={[]}
      headingTitle="title"
      reasonsTitle="reasons"
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
