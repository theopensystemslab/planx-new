import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";
import { axe } from "vitest-axe";

import { Condition, Operator } from "../shared/RuleBuilder/types";
import NextStepsComponent from "./Public";

const { getState, setState } = useStore;

beforeEach(() => {
  getState().resetPreview();
});

it("should not have any accessibility violations", async () => {
  const { container } = await setup(
    <NextStepsComponent
      title="title"
      description="description"
      steps={[
        { title: "option 1", description: "", url: "" },
        { title: "option 2", description: "", url: "" },
      ]}
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("only shows steps whose rules are met", async () => {
  setState({
    flow: {
      _root: { edges: ["question"] },
      question: {
        type: TYPES.Question,
        data: { fn: "mockFn" },
        edges: ["answer"],
      },
      answer: { type: TYPES.Answer, data: { val: "mockVal" } },
    },
    breadcrumbs: { question: { auto: false, answers: ["answer"] } },
  });

  await setup(
    <NextStepsComponent
      title="My title"
      hasStepRules
      steps={[
        {
          title: "First step",
          rule: {
            condition: Condition.RequiredIf,
            operator: Operator.Equals,
            fn: "mockFn",
            val: "mockVal",
          },
        },
        {
          title: "Second step",
          rule: {
            condition: Condition.RequiredIf,
            operator: Operator.Equals,
            fn: "mockFn",
            val: "otherMockVal",
          },
        },
      ]}
    />,
  );

  expect(screen.getByText("First step")).toBeVisible();
  expect(screen.queryByText("Second step")).not.toBeInTheDocument();
});
