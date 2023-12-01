import { removeOrphansFromBreadcrumbs } from "../../store/preview";

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
