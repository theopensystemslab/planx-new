import { TYPES } from "@planx/components/types";
import cloneDeep from "lodash/cloneDeep";

import { Store, vanillaStore } from "../store";
import {
  removeNodesDependentOnPassport,
  removeOrphansFromBreadcrumbs,
} from "../store/preview";
import breadcrumbsDependentOnPassportMock from "./mocks/breadcrumbsDependentOnPassport.json";
import flowWithAutoAnswersMock from "./mocks/flowWithAutoAnswers.json";
import flowWithPassportComponentsMock from "./mocks/flowWithPassportComponents.json";

const { getState, setState } = vanillaStore;
let breadcrumbsDependentOnPassport = cloneDeep(
  breadcrumbsDependentOnPassportMock,
) as Store.breadcrumbs;
let flowWithPassportComponents = cloneDeep(
  flowWithPassportComponentsMock,
) as Store.flow;
const flowWithAutoAnswers = cloneDeep(flowWithAutoAnswersMock) as Store.flow;

const {
  record,
  upcomingCardIds,
  currentCard,
  resetPreview,
  hasPaid,
  previousCard,
  changeAnswer,
  computePassport,
} = getState();

beforeEach(() => {
  resetPreview();
  breadcrumbsDependentOnPassport = cloneDeep(
    breadcrumbsDependentOnPassportMock,
  ) as Store.breadcrumbs;
  flowWithPassportComponents = cloneDeep(
    flowWithPassportComponentsMock,
  ) as Store.flow;
});

test("it lists upcoming cards", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.Statement,
        edges: ["c"],
      },
      b: {
        type: TYPES.Statement,
      },
      c: {
        type: TYPES.Response,
        edges: ["d"],
      },
      d: {
        type: TYPES.Statement,
        edges: ["e", "f"],
      },
      e: { type: TYPES.Response },
      f: { type: TYPES.Response },
    },
  });

  expect(upcomingCardIds()).toEqual(["a"]);

  record("a", { answers: ["c"] });

  expect(upcomingCardIds()).toEqual(["d"]);

  record("d", { answers: ["e", "f"] });

  expect(upcomingCardIds()).toEqual([]);
});

test("notice", () => {
  setState({
    flow: {
      _root: {
        edges: ["a"],
      },
      a: {
        type: TYPES.Notice,
      },
    },
  });

  expect(upcomingCardIds()).toEqual(["a"]);
});

test("crawling with portals", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.InternalPortal,
        edges: ["c"],
      },
      b: {
        edges: ["d"],
      },
      c: {
        edges: ["d"],
      },
      d: {},
    },
  });

  expect(upcomingCardIds()).toEqual(["c", "b"]);
});

describe("error handling", () => {
  test("cannot record id that doesn't exist", () => {
    setState({
      flow: {
        _root: {
          edges: ["a", "b"],
        },
        a: {
          type: TYPES.InternalPortal,
          edges: ["c"],
        },
        b: {
          edges: ["d"],
        },
        c: {
          edges: ["d"],
        },
        d: {},
      },
    });

    expect(() => record("x", {})).toThrow("id not found");
  });
});

test("record(id, undefined) clears up breadcrumbs", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.Statement,
        edges: ["c"],
      },
      b: {
        type: TYPES.Statement,
      },
      c: {
        type: TYPES.Response,
        edges: ["d"],
      },
      d: {
        type: TYPES.Statement,
        edges: ["e", "f"],
      },
      e: { type: TYPES.Response },
      f: { type: TYPES.Response },
    },
  });
  record("a", { answers: ["c"] });
  record("d", { answers: ["e", "f"] });
  expect(getState().breadcrumbs).toEqual({
    a: { answers: ["c"], auto: false },
    d: { answers: ["e", "f"], auto: false },
  });

  record("a");

  expect(getState().breadcrumbs).toEqual({});
});

test("hasPaid is updated if a Pay component has been recorded", () => {
  setState({
    flow: {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        type: TYPES.Statement,
        edges: ["c"],
      },
      b: {
        type: TYPES.Statement,
      },
      c: {
        type: TYPES.Pay,
      },

      d: { type: TYPES.Response },
      e: { type: TYPES.Review },
    },
  });

  record("a", { answers: ["c"] });
  expect(hasPaid()).toBe(false);

  record("c", {});
  expect(getState().breadcrumbs).toEqual({
    a: { answers: ["c"], auto: false },
    c: { auto: false },
  });

  expect(hasPaid()).toBe(true);
});

describe("removeOrphansFromBreadcrumbs", () => {
  test("Deletes orphans from breadcrumbs when changing answers", () => {
    const payload = {
      ...mockFlowData,
      userData: {
        auto: false,
        answers: ["4FRZMfNlXf"],
      },
    };

    const actual = removeOrphansFromBreadcrumbs(payload);

    const expected = {
      mBFPszBssY: mockBreadcrumbs["mBFPszBssY"],
      OjcsvOxVum: mockBreadcrumbs["OjcsvOxVum"],
    };

    expect(actual).toEqual(expected);
  });

  test("Should keep breadcrumbs when tree is not changed", () => {
    const payload = {
      ...mockFlowData,
      userData: {
        auto: false,
        answers: ["4FRZMfNlXf", "IzT93uCmyF"],
      },
    };

    const actual = removeOrphansFromBreadcrumbs(payload);

    const expected = mockBreadcrumbs;

    expect(actual).toEqual(expected);
  });
});

describe("removeNodesDependentOnPassport", () => {
  test("Deletes nodes that are dependent on passport", () => {
    const breadcrumbs = { ...breadcrumbsDependentOnPassport };

    const { breadcrumbsWithoutPassportData, removedNodeIds } =
      removeNodesDependentOnPassport(flowWithPassportComponents, breadcrumbs);

    const expectedBreadcrumbs = {
      findProperty: breadcrumbs["findProperty"],
      text: breadcrumbs["text"],
      text2: breadcrumbs["text2"],
    };

    const expectRemovedNots = ["planningConstraints", "drawBoundary"];

    expect(breadcrumbsWithoutPassportData).toEqual(expectedBreadcrumbs);
    expect(removedNodeIds.sort()).toEqual(expectRemovedNots.sort());
  });

  test("Should not remove components that does not depend on passport", () => {
    const breadcrumbs = { ...mockBreadcrumbs };

    const { breadcrumbsWithoutPassportData, removedNodeIds } =
      removeNodesDependentOnPassport(mockFlowData as Store.flow, breadcrumbs);

    const expectedBreadcrumbs = { ...mockBreadcrumbs };

    expect(breadcrumbsWithoutPassportData).toEqual(expectedBreadcrumbs);
    expect(removedNodeIds).toHaveLength(0);
  });
});

describe("record", () => {
  test("should remove Draw Boundary and Planning contraints from cachedBreadcrumbs", () => {
    const cachedBreadcrumbs = {
      ...breadcrumbsDependentOnPassport,
    } as Store.cachedBreadcrumbs;
    const userData = {
      data: {
        _address: {
          uprn: "200003453487",
          blpu_code: "2",
          latitude: 51.4854766,
          longitude: -0.0762087,
          organisation: null,
          sao: null,
          pao: "61",
          street: "COBOURG ROAD",
          town: "LONDON",
          postcode: "SE5 0HU",
          x: 533673,
          y: 178035,
          planx_description: "Terrace",
          planx_value: "residential.dwelling.house.terrace",
          single_line_address: "61, COBOURG ROAD, LONDON, SE5 0HU",
          title: "61, COBOURG ROAD, LONDON",
        },
        "property.type": ["residential.dwelling.house.terrace"],
      },
      auto: false,
    };

    setState({
      flow: flowWithPassportComponents,
      cachedBreadcrumbs: cachedBreadcrumbs,
    });

    record("findProperty", userData);

    const expectedBreadcrumbs = {
      findProperty: userData,
    };
    const expectedCachedBreadcrumbs = {
      text: { ...breadcrumbsDependentOnPassport.text },
      text2: { ...breadcrumbsDependentOnPassport.text2 },
    };

    expect(getState().breadcrumbs).toEqual(expectedBreadcrumbs);
    expect(getState().cachedBreadcrumbs).toEqual(expectedCachedBreadcrumbs);
  });

  test("should remove Planning constraints from cachedBreadcrumbs", () => {
    const cachedBreadcrumbs = {
      ...breadcrumbsDependentOnPassport,
    } as Store.cachedBreadcrumbs;
    const userData = {
      data: {
        "property.boundary.site": {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-0.07621044170298559, 51.48592097290779],
                [-0.07624025427274797, 51.48585256133697],
                [-0.07610712900581225, 51.48581443104476],
                [-0.07607971324929909, 51.485878772190574],
                [-0.07621044170298559, 51.48592097290779],
              ],
            ],
          },
          properties: null,
        },
        "property.boundary.area": 76.27,
      },
      auto: false,
    };

    setState({
      flow: flowWithPassportComponents,
      cachedBreadcrumbs: cachedBreadcrumbs,
    });

    record("drawBoundary", userData);

    const expectedBreadcrumbs = {
      drawBoundary: userData,
    };
    const expectedCachedBreadcrumbs = {
      findProperty: { ...breadcrumbsDependentOnPassport.findProperty },
      text: { ...breadcrumbsDependentOnPassport.text },
      text2: { ...breadcrumbsDependentOnPassport.text2 },
    };

    expect(getState().breadcrumbs).toEqual(expectedBreadcrumbs);
    expect(getState().cachedBreadcrumbs).toEqual(expectedCachedBreadcrumbs);
  });

  test("should go to the next node pending edition", () => {
    const breadcrumbs = {
      findProperty: breadcrumbsDependentOnPassport.findProperty,
      text: breadcrumbsDependentOnPassport.text,
    };
    const flow = { ...flowWithPassportComponents };
    const _nodesPendingEdit = ["drawBoundary", "planningConstraints"];

    setState({
      flow,
      breadcrumbs,
      _nodesPendingEdit,
    });

    record("findProperty", {
      answers: [],
      auto: false,
      data: {
        _address: breadcrumbsDependentOnPassport.findProperty.data?._address,
        single_line_address: "61, COBOURG ROAD, LONDON, SE5 0HU",
        title: "61, COBOURG ROAD, LONDON",
        "property.type":
          breadcrumbsDependentOnPassport.findProperty.data?.["property.type"],
      },
    });

    expect(currentCard()?.id).toEqual("drawBoundary");
  });

  test("should clear _nodesPendingEdit after edition", () => {
    const breadcrumbs = {
      findProperty: breadcrumbsDependentOnPassport.findProperty,
      text: breadcrumbsDependentOnPassport.text,
      drawBoundary: breadcrumbsDependentOnPassport.drawBoundary,
    };
    const flow = { ...flowWithPassportComponents };
    const _nodesPendingEdit = ["drawBoundary", "planningConstraints"];

    setState({
      flow,
      breadcrumbs,
      _nodesPendingEdit,
    });

    record("planningConstraints", {
      answers: [],
      auto: false,
      data: {
        _nots: {
          "property.constraints.planning": [],
        },
      },
    });

    expect(getState()._nodesPendingEdit).toHaveLength(0);
  });
});

describe("previousCard", () => {
  test("To be the card before the current one", () => {
    const breadcrumbs = {
      findProperty: breadcrumbsDependentOnPassport.findProperty,
      text: breadcrumbsDependentOnPassport.text,
      text2: breadcrumbsDependentOnPassport.text2,
    };
    const flow = { ...flowWithPassportComponents };

    setState({
      breadcrumbs,
      flow,
      _nodesPendingEdit: [],
    });

    expect(currentCard()?.id).toEqual("drawBoundary");
    expect(previousCard(currentCard())).toEqual("text");
  });

  test("To be last pushed to the breadcrumbs when changing answer", () => {
    const breadcrumbs = {
      text: breadcrumbsDependentOnPassport.text,
      findProperty: breadcrumbsDependentOnPassport.findProperty,
    };
    const flow = { ...flowWithPassportComponents };
    const _nodesPendingEdit = ["drawBoundary", "planningConstraints"];

    setState({
      breadcrumbs,
      flow,
      _nodesPendingEdit,
    });

    expect(previousCard(currentCard())).toEqual("findProperty");
  });
});

describe("changeAnswer", () => {
  test("should set state correctly", () => {
    const breadcrumbs = {
      text: breadcrumbsDependentOnPassport.text,
      findProperty: breadcrumbsDependentOnPassport.findProperty,
    };
    const flow = { ...flowWithPassportComponents };

    setState({
      flow,
      breadcrumbs,
    });

    changeAnswer("findProperty");

    expect(getState().changedNode).toEqual("findProperty");
  });

  test("should keep breadcrumbs order", () => {
    const breadcrumbs = breadcrumbsDependentOnPassport;
    const flow = { ...flowWithPassportComponents };

    setState({
      flow,
      breadcrumbs,
      cachedBreadcrumbs: {},
    });

    changeAnswer("text");
    record("text", {
      ...breadcrumbs.text,
      auto: false,
      data: {
        text: "Changed",
      },
    });

    expect(getState().changedNode).toEqual("text");

    const changedBreadcrumbs = {
      ...getState().breadcrumbs,
      ...getState().cachedBreadcrumbs,
    };
    const changedBreadcrumbKeys = Object.keys(changedBreadcrumbs);
    const originalBreadcrumbKeys = Object.keys(breadcrumbsDependentOnPassport);
    expect(changedBreadcrumbKeys).toStrictEqual(originalBreadcrumbKeys);
  });

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

const mockBreadcrumbs = {
  mBFPszBssY: {
    auto: false,
    answers: ["IzT93uCmyF", "4FRZMfNlXf"],
  },
  "1eJjMmhGBU": {
    auto: false,
    answers: ["GxcDrNTW26"],
  },
  J5SvQgzuK0: {
    auto: false,
    answers: ["DTXNs02JmU"],
  },
  AHOdMRaRGK: {
    auto: false,
    data: {
      AHOdMRaRGK: "Answer",
    },
  },
  OjcsvOxVum: {
    auto: false,
    data: {
      OjcsvOxVum: "Test",
    },
  },
};

const mockFlowData = {
  id: "mBFPszBssY",
  flow: {
    _root: {
      edges: ["mBFPszBssY", "fCg1EeibAD"],
    },
    "1eJjMmhGBU": {
      data: {
        text: "Question",
      },
      type: 100,
      edges: ["Om0CWNHoDs", "GxcDrNTW26"],
    },
    "4FRZMfNlXf": {
      data: {
        flag: "PP-NOT_DEVELOPMENT",
        text: "Not development",
      },
      type: 200,
      edges: ["OjcsvOxVum"],
    },
    AHOdMRaRGK: {
      data: {
        title: "Question text",
      },
      type: 110,
    },
    DTXNs02JmU: {
      data: {
        text: "A2",
      },
      type: 200,
      edges: ["AHOdMRaRGK"],
    },
    GM8yVE4Fgm: {
      data: {
        title: "Prior approval ",
      },
      type: 110,
    },
    GxcDrNTW26: {
      data: {
        text: "path2",
      },
      type: 200,
      edges: ["J5SvQgzuK0"],
    },
    IzT93uCmyF: {
      data: {
        flag: "PRIOR_APPROVAL",
        text: "Prior",
      },
      type: 200,
      edges: ["1eJjMmhGBU"],
    },
    J5SvQgzuK0: {
      data: {
        text: "Question 2",
      },
      type: 100,
      edges: ["fSN4QxmM2w", "DTXNs02JmU"],
    },
    OjcsvOxVum: {
      data: {
        title: "Non development text",
      },
      type: 110,
    },
    Om0CWNHoDs: {
      data: {
        text: "path1",
      },
      type: 200,
      edges: ["GM8yVE4Fgm"],
    },
    fSN4QxmM2w: {
      data: {
        text: "A1",
      },
      type: 200,
    },
    mBFPszBssY: {
      data: {
        text: "Checklist for review",
        allRequired: false,
      },
      type: 105,
      edges: ["IzT93uCmyF", "4FRZMfNlXf"],
    },
  },
  breadcrumbs: mockBreadcrumbs,
};
