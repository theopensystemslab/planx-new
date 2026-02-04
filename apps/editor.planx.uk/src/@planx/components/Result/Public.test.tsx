import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { useStore } from "../../../pages/FlowEditor/lib/store";
import { Presentational } from "./Public";

const { getState, setState } = useStore;

beforeEach(() => {
  getState().resetPreview();
});

test("renders correctly", async () => {
  const handleSubmit = vi.fn();

  const { user } = await setup(
    <Presentational
      headingColor={{ text: "#000", background: "#fff" }}
      responses={[]}
      handleSubmit={handleSubmit}
      headingTitle="AMAZING"
    />,
  );

  expect(screen.getAllByRole("heading")[0]).toHaveTextContent("AMAZING");
  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalled();
});

it("should not have any accessibility violations", async () => {
  const { container } = await setup(
    <Presentational
      headingColor={{ text: "#000", background: "#fff" }}
      responses={[
        {
          question: { data: { text: "Is this hidden?" }, id: "a" },
          hidden: false,
          selections: [],
        },
        {
          question: { data: { text: "Is this shown?" }, id: "b" },
          hidden: true,
          selections: [],
        },
      ]}
      allowChanges
      headingTitle="title"
      reasonsTitle="reasons"
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

describe("showing and hiding change capabilities", () => {
  it("hides the change button by default", async () => {
    await setup(
      <Presentational
        responses={[
          {
            question: { data: { text: "How's the weather?" }, id: "a" },
            hidden: false,
            selections: [],
          },
        ]}
        handleSubmit={() => {}}
        headingColor={{ text: "pink", background: "white" }}
      />,
    );

    expect(screen.queryByText("Change")).not.toBeInTheDocument();
  });

  describe("change button scenarios", () => {
    // `responses` need to be available outside the `beforeEach` block
    let responses: Array<any>;

    beforeEach(() => {
      // a basic flow state where the second question has been
      // auto-answered based on the first question's responses.
      // see: https://imgur.com/a/llkklXB
      // state code below was copy/pasted from an example flow
      // for now, but could be simplified in future.

      setState({
        breadcrumbs: {
          "1mOeERQtaC": {
            auto: false,
            answers: ["DaDuvkVptX"],
          },
          oMb32KxEsJ: {
            answers: ["WrC0G1zSud"],
            auto: true,
          },
        },
      });

      responses = [
        {
          question: {
            id: "1mOeERQtaC",
            data: {
              fn: "test",
              text: "test",
            },
            type: 100,
            edges: ["DaDuvkVptX", "dNJPqsXIR9"],
          },
          selections: [
            {
              id: "DaDuvkVptX",
              data: {
                val: "1",
                text: "1",
              },
              type: 200,
            },
          ],
          hidden: false,
        },
        {
          question: {
            id: "oMb32KxEsJ",
            data: {
              fn: "test",
              text: "test",
            },
            type: 100,
            edges: ["WrC0G1zSud", "2E5gpk8Fpu"],
          },
          selections: [
            {
              id: "WrC0G1zSud",
              data: {
                val: "1",
                text: "1",
              },
              type: 200,
            },
          ],
          hidden: false,
        },
      ];
    });

    const scenarios = [
      { allowChanges: true, autoAnswered: true, shouldBeChangeable: true },
      { allowChanges: false, autoAnswered: false, shouldBeChangeable: false },
      { allowChanges: true, autoAnswered: false, shouldBeChangeable: true },
      { allowChanges: false, autoAnswered: true, shouldBeChangeable: false },
    ];

    scenarios.forEach(({ allowChanges, autoAnswered, shouldBeChangeable }) => {
      it(`${
        shouldBeChangeable ? "shows" : "hides"
      } the change button when allowChanges is ${allowChanges} and question ${
        autoAnswered ? "was" : "wasn't"
      } auto-answered`, async () => {
        await setup(
          <Presentational
            {...{ allowChanges, responses }}
            handleSubmit={() => {}}
            headingColor={{ text: "pink", background: "white" }}
          />,
        );

        expect(Boolean(screen.queryByText("Change"))).toEqual(
          shouldBeChangeable,
        );
      });
    });
  });
});
