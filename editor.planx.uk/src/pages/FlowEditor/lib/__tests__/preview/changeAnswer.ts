import cloneDeep from "lodash/cloneDeep";

import { Store, vanillaStore } from "../../store";
import flowWithAutoAnswersMock from "../mocks/flowWithAutoAnswers.json";

const { getState, setState } = vanillaStore;

const flowWithAutoAnswers = cloneDeep(flowWithAutoAnswersMock) as Store.flow;

const { record, changeAnswer, computePassport } = getState();

describe("changeAnswer", () => {
  test("should auto-answer future nodes with the updated passport variable correctly", () => {
    // See https://trello.com/c/B8xMMJLo/1930-changes-from-the-review-page-that-affect-the-fee-do-not-update-the-fee
    //   and https://editor.planx.uk/testing/autoanswer-change-test
    const flow = { ...flowWithAutoAnswers };

    // Mock initial state as if we've initially answered "Yes" to the question and reached the Review component, about to click "change"
    const breadcrumbs = {
      rCjETwjwE3: {
        auto: false,
        answers: ["b0qdvLAxIL"],
      },
      vgj2UNYK9r: {
        answers: ["X9JjnbPpnd"],
        auto: true,
      },
    } as Store.breadcrumbs;
    const cachedBreadcrumbs = {} as Store.cachedBreadcrumbs;

    setState({
      flow,
      breadcrumbs,
      cachedBreadcrumbs,
    });

    // Assert our initial passport state is correct
    expect(computePassport()).toEqual({
      data: {
        "application.fee.exemption.disability": ["true"],
      },
    });

    // Change the question answer from "Yes" to "No"
    changeAnswer("rCjETwjwE3");
    record("rCjETwjwE3", {
      answers: ["ykNZocRJtQ"],
      auto: false,
    });

    expect(getState().changedNode).toEqual("rCjETwjwE3");

    // Confirm the passport has updated to reflect new answer and has not retained previous answer
    expect(computePassport()).toEqual({
      data: {
        "application.fee.exemption.disability": ["false"],
      },
    });

    const originalAnswer = {
      vgj2UNYK9r: {
        answers: ["X9JjnbPpnd"],
        auto: true,
      },
    } as Store.cachedBreadcrumbs;

    // Confirm that our original answer is still preserved in cachedBreadcrumbs, but not included in current breadcrumbs
    expect(getState().breadcrumbs).not.toContain(originalAnswer);
    expect(getState().cachedBreadcrumbs).toStrictEqual(originalAnswer);
  });
});
