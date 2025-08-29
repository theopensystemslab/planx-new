import { Store } from "../../store";
import { removeOrphansFromBreadcrumbs } from "../../store/preview";
import mockFlowData from "../mocks/removeOrphansFlow.json";

describe("simple flow", () => {
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
          flags: ["flag.pp.notDevelopment"],
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
          flags: ["flag.pp.priorApproval"],
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

/**
 * Based on Camden LDC, snapshot taken 28/08/25
 */
describe("complex flow", () => {
  const mockBreadcrumbs = {
    hogz2qW01b: {
      auto: true,
      answers: ["vASjIqW01b"],
    },
    OYAoJqW01b: {
      auto: true,
    },
    pYr9XuA88C: {
      auto: true,
      answers: ["d48Z0uA88C"],
    },
    epfQyuA88C: {
      auto: true,
    },
    KRkUruA88C: {
      auto: true,
      answers: ["oCromuA88C"],
    },
    "7VNGiwzDy4": {
      auto: true,
    },
    "4kEHc0n3Cy": {
      auto: true,
      answers: ["vbbcMsoYTg"],
    },
    rjC3Hgqkth: {
      auto: true,
    },
    LtVBNzjOqe: {
      auto: true,
    },
  };

  /**
   * In practice, this generally completes in ~15ms
   * Bumping timeout accounts for differences in CI and developer machines whilst still ensuring it's performant enough
   */
  test("Efficiently iterates over a large (7mb) flow in less than 50ms", () => {
    const payload = {
      id: "hogz2qW01b",
      flow: mockFlowData as Store.Flow,
      breadcrumbs: mockBreadcrumbs,
      userData: {
        auto: true,
        answers: ["vASjIqW01b"],
      },
    };

    const actual = removeOrphansFromBreadcrumbs(payload);

    const expected = {
      hogz2qW01b: {
        auto: true,
        answers: ["vASjIqW01b"],
      },
      OYAoJqW01b: {
        auto: true,
      },
      pYr9XuA88C: {
        auto: true,
        answers: ["d48Z0uA88C"],
      },
      epfQyuA88C: {
        auto: true,
      },
      KRkUruA88C: {
        auto: true,
        answers: ["oCromuA88C"],
      },
      "7VNGiwzDy4": {
        auto: true,
      },
      "4kEHc0n3Cy": {
        auto: true,
        answers: ["vbbcMsoYTg"],
      },
      rjC3Hgqkth: {
        auto: true,
      },
      LtVBNzjOqe: {
        auto: true,
      },
    };

    expect(actual).toEqual(expected);
  }, 50);
});