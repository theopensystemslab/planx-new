import { TYPES } from "@planx/components/types";
import cloneDeep from "lodash/cloneDeep";

import { Store, vanillaStore } from "../store";
import {
  removeNodesDependentOnPassport,
  removeOrphansFromBreadcrumbs,
} from "../store/preview";
import breadcrumbsDependentOnPassportMock from "./mocks/breadcrumbsDependentOnPassport.json";
import flowWithPassportComponentsMock from "./mocks/flowWithPassportComponents.json";

const { getState, setState } = vanillaStore;
let breadcrumbsDependentOnPassport = cloneDeep(
  breadcrumbsDependentOnPassportMock
) as Store.breadcrumbs;
let flowWithPassportComponents = cloneDeep(
  flowWithPassportComponentsMock
) as Store.flow;

beforeEach(() => {
  getState().resetPreview();
  breadcrumbsDependentOnPassport = cloneDeep(
    breadcrumbsDependentOnPassportMock
  ) as Store.breadcrumbs;
  flowWithPassportComponents = cloneDeep(
    flowWithPassportComponentsMock
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

  expect(getState().upcomingCardIds()).toEqual(["a"]);

  getState().record("a", { answers: ["c"] });

  expect(getState().upcomingCardIds()).toEqual(["d"]);

  getState().record("d", { answers: ["e", "f"] });

  expect(getState().upcomingCardIds()).toEqual([]);
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

  expect(getState().upcomingCardIds()).toEqual(["a"]);
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

  expect(getState().upcomingCardIds()).toEqual(["c", "b"]);
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

    expect(() => getState().record("x", {})).toThrowError("id not found");
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
  getState().record("a", { answers: ["c"] });
  getState().record("d", { answers: ["e", "f"] });
  expect(getState().breadcrumbs).toEqual({
    a: { answers: ["c"], auto: false },
    d: { answers: ["e", "f"], auto: false },
  });

  getState().record("a");

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

  getState().record("a", { answers: ["c"] });
  expect(getState().hasPaid()).toBe(false);

  getState().record("c", {});
  expect(getState().breadcrumbs).toEqual({
    a: { answers: ["c"], auto: false },
    c: { auto: false },
  });

  expect(getState().hasPaid()).toBe(true);
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
  test("Deletes nots that are dependent on passport", () => {
    const breadcrumbs = { ...breadcrumbsDependentOnPassport };

    const { breadcrumbsWithoutPassportData, removedNotsIds } =
      removeNodesDependentOnPassport(flowWithPassportComponents, breadcrumbs);

    const expectedBreadcrumbs = {
      findProperty: breadcrumbs["findProperty"],
      text: breadcrumbs["text"],
      text2: breadcrumbs["text2"],
    };

    const expectRemovedNots = ["planningConstraints", "drawBoundary"];

    expect(breadcrumbsWithoutPassportData).toEqual(expectedBreadcrumbs);
    expect(removedNotsIds.sort()).toEqual(expectRemovedNots.sort());
  });

  test("Should not remove components that does not depend on passport", () => {
    const breadcrumbs = { ...mockBreadcrumbs };

    const { breadcrumbsWithoutPassportData, removedNotsIds } =
      removeNodesDependentOnPassport(mockFlowData as Store.flow, breadcrumbs);

    const expectedBreadcrumbs = { ...mockBreadcrumbs };

    expect(breadcrumbsWithoutPassportData).toEqual(expectedBreadcrumbs);
    expect(removedNotsIds).toHaveLength(0);
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
    // delete cachedBreadcrumbs?.findProperty;

    setState({
      flow: flowWithPassportComponents,
      cachedBreadcrumbs: cachedBreadcrumbs,
    });

    getState().record("findProperty", userData);

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

  test("should go to the next not pending edition", () => {
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

    getState().record("findProperty", {
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

    expect(getState().currentCard()?.id).toEqual("drawBoundary");
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

    getState().record("planningConstraints", {
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

    expect(getState().previousCard()).toEqual("text");
  });

  test("To be last pushed to the breadcrumbs", () => {
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

    expect(getState().previousCard()).toEqual("findProperty");
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

    getState().changeAnswer("findProperty");

    expect(getState().changedNode).toEqual("findProperty");
    expect(getState().restore).toStrictEqual(true);
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
