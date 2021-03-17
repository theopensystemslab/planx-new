import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    expect(screen.queryByText("change")).toBeFalsy();
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

    expect(screen.queryByText("change")).toBeTruthy();
  });
});
