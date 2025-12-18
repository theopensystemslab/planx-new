import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import cloneDeep from "lodash/cloneDeep";
import { expect } from "vitest";

import { Store, useStore } from "../../store";
import { removeNodesDependentOnPassport } from "../../store/preview";
import breadcrumbsDependentOnPassportMock from "../mocks/breadcrumbsDependentOnPassport.json";
import flowWithPassportComponentsMock from "../mocks/flowWithPassportComponents.json";

const { getState, setState } = useStore;

let breadcrumbsDependentOnPassport = cloneDeep(
  breadcrumbsDependentOnPassportMock,
) as Store.Breadcrumbs;

let flowWithPassportComponents = cloneDeep(
  flowWithPassportComponentsMock,
) as Store.Flow;

const {
  record,
  resetPreview,
  previousCard,
  getCurrentCard,
  changeAnswer,
  setCurrentCard,
} = getState();

beforeEach(() => {
  resetPreview();
  breadcrumbsDependentOnPassport = cloneDeep(
    breadcrumbsDependentOnPassportMock,
  ) as Store.Breadcrumbs;
  flowWithPassportComponents = cloneDeep(
    flowWithPassportComponentsMock,
  ) as Store.Flow;
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

    const expectRemovedNots = [
      "mapAndLabel",
      "planningConstraints",
      "drawBoundary",
    ];

    expect(breadcrumbsWithoutPassportData).toEqual(expectedBreadcrumbs);
    expect(removedNodeIds.sort()).toEqual(expectRemovedNots.sort());
  });

  test("Should not remove components that does not depend on passport", () => {
    const breadcrumbs = { ...mockBreadcrumbs };

    const { breadcrumbsWithoutPassportData, removedNodeIds } =
      removeNodesDependentOnPassport(mockFlowData as Store.Flow, breadcrumbs);

    const expectedBreadcrumbs = { ...mockBreadcrumbs };

    expect(breadcrumbsWithoutPassportData).toEqual(expectedBreadcrumbs);
    expect(removedNodeIds).toHaveLength(0);
  });
});

describe("nodesDependentOnPassport with record", () => {
  test("should remove DrawBoundary, PlanningConstraints, and MapAndLabel from cachedBreadcrumbs after FindProperty changes", () => {
    const cachedBreadcrumbs = {
      ...breadcrumbsDependentOnPassport,
    } as Store.CachedBreadcrumbs;
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
      createdAt: expect.any(String),
      seq: expect.any(Number),
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

  test("should remove PlanningConstraints and MapAndLabel from cachedBreadcrumbs after DrawBoundary changes and retain FindProperty breadcrumbs", () => {
    const cachedBreadcrumbs = {
      ...breadcrumbsDependentOnPassport,
    } as Store.CachedBreadcrumbs;
    const userData = {
      data: {
        "proposal.site": {
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
        "proposal.site.area": 76.27,
      },
      auto: false,
      createdAt: expect.any(String),
      seq: expect.any(Number),
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
    const _nodesPendingEdit = [
      "drawBoundary",
      "planningConstraints",
      "mapAndLabel",
    ];

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

    expect(getCurrentCard()?.id).toEqual("drawBoundary");
  });

  test("should clear _nodesPendingEdit after continuing through final dependent component type", () => {
    const breadcrumbs = {
      findProperty: breadcrumbsDependentOnPassport.findProperty,
      text: breadcrumbsDependentOnPassport.text,
      drawBoundary: breadcrumbsDependentOnPassport.drawBoundary,
    };
    const flow = { ...flowWithPassportComponents };
    const _nodesPendingEdit = [
      "drawBoundary",
      "planningConstraints",
      "mapAndLabel",
    ];

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

    record("mapAndLabel", {
      answers: [],
      auto: false,
      data: {
        trees: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-0.07626448954420499, 51.48571252157308],
                [-0.0762916416717913, 51.48561932090584],
                [-0.07614058275089933, 51.485617225458554],
                [-0.07611118911905082, 51.4857099488319],
                [-0.07626448954420499, 51.48571252157308],
              ],
            ],
          },
          properties: {
            label: 1,
            species: "Elm",
          },
        },
      },
    });

    expect(getState()._nodesPendingEdit).toHaveLength(0);
  });
});

describe("nodesDependentOnPassport with previousCard", () => {
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

    // Manually call setCurrentCard() as we're not using record() as part of our setup
    setCurrentCard();

    expect(getCurrentCard()?.id).toEqual("drawBoundary");
    expect(previousCard(getCurrentCard())).toEqual("text");
  });

  test("To be last pushed to the breadcrumbs when changing answer", () => {
    const breadcrumbs = {
      text: breadcrumbsDependentOnPassport.text,
      findProperty: breadcrumbsDependentOnPassport.findProperty,
    };
    const flow = { ...flowWithPassportComponents };
    const _nodesPendingEdit = [
      "drawBoundary",
      "planningConstraints",
      "mapAndLabel",
    ];

    setState({
      breadcrumbs,
      flow,
      _nodesPendingEdit,
    });

    expect(previousCard(getCurrentCard())).toEqual("findProperty");
  });
});

describe("nodesDependentOnPassport with changeAnswer", () => {
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
      type: TYPES.Question,
      edges: ["Om0CWNHoDs", "GxcDrNTW26"],
    },
    "4FRZMfNlXf": {
      data: {
        flags: ["flag.pp.notDevelopment"],
        text: "Not development",
      },
      type: TYPES.Answer,
      edges: ["OjcsvOxVum"],
    },
    AHOdMRaRGK: {
      data: {
        title: "Question text",
      },
      type: TYPES,
    },
    DTXNs02JmU: {
      data: {
        text: "A2",
      },
      type: TYPES.Answer,
      edges: ["AHOdMRaRGK"],
    },
    GM8yVE4Fgm: {
      data: {
        title: "Prior approval ",
      },
      type: TYPES.TextInput,
    },
    GxcDrNTW26: {
      data: {
        text: "path2",
      },
      type: TYPES.Answer,
      edges: ["J5SvQgzuK0"],
    },
    IzT93uCmyF: {
      data: {
        flags: ["flag.pp.priorApproval"],
        text: "Prior",
      },
      type: TYPES.Answer,
      edges: ["1eJjMmhGBU"],
    },
    J5SvQgzuK0: {
      data: {
        text: "Question 2",
      },
      type: TYPES.Question,
      edges: ["fSN4QxmM2w", "DTXNs02JmU"],
    },
    OjcsvOxVum: {
      data: {
        title: "Non development text",
      },
      type: TYPES.TextInput,
    },
    Om0CWNHoDs: {
      data: {
        text: "path1",
      },
      type: TYPES.Answer,
      edges: ["GM8yVE4Fgm"],
    },
    fSN4QxmM2w: {
      data: {
        text: "A1",
      },
      type: TYPES.Answer,
    },
    mBFPszBssY: {
      data: {
        text: "Checklist for review",
        allRequired: false,
      },
      type: TYPES.Checklist,
      edges: ["IzT93uCmyF", "4FRZMfNlXf"],
    },
  },
  breadcrumbs: mockBreadcrumbs,
};
