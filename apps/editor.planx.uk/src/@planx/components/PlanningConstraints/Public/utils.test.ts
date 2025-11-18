import {
  defaultIntersectingConstraints,
  defaultNots,
  mockConstraints,
} from "../mocks/overrides/constraints";
import { DEFAULT_FN } from "../model";
import { handleOverrides } from "./utils";

describe("handleOverrides basic", () => {
  test("when no constraints are reported as inaccurate, it returns the original intersections and nots", () => {
    const overrides = undefined;
    const result = handleOverrides(
      DEFAULT_FN,
      mockConstraints,
      overrides,
      defaultIntersectingConstraints,
      defaultNots,
    );

    expect(result).toEqual({
      intersectingConstraints: defaultIntersectingConstraints,
      nots: defaultNots,
    });
  });

  // Intentional skip, not handling these edge cases yet!
  test.skip("when a constraint was reported as inaccurate, but is not part of the latest GIS API response, it's skipped", () => {
    const overrides = {
      listed: {
        entities: ["some-outdated-entity"],
        reason: "This isn't here anymore",
      },
    };
    const result = handleOverrides(
      DEFAULT_FN,
      mockConstraints,
      overrides,
      defaultIntersectingConstraints,
      defaultNots,
    );

    expect(result).toEqual({
      intersectingConstraints: defaultIntersectingConstraints,
      nots: defaultNots,
    });
  });

  test("when many constraints are reported as inaccurate, all categories are correctly updated", () => {
    const overrides = {
      "designated.conservationArea": {
        entities: ["44006848"],
        reason: "I'm not in a conservation area",
      },
      listed: {
        entities: ["42101437"],
        reason:
          "I don't recognize this listed building name, I don't think it's for my property",
      },
    };
    const result = handleOverrides(
      DEFAULT_FN,
      mockConstraints,
      overrides,
      defaultIntersectingConstraints,
      defaultNots,
    );

    expect(result["intersectingConstraints"][DEFAULT_FN]).not.toContain(
      "designated.conservationArea",
    );
    expect(result["intersectingConstraints"][DEFAULT_FN]).not.toContain(
      "designated",
    );
    expect(result["intersectingConstraints"][DEFAULT_FN]).toContain("listed");
    expect(result["intersectingConstraints"][DEFAULT_FN]).toContain(
      "listed.gradeTwo",
    );
  });
});

describe("handleOverrides with non-granular constraint categories", () => {
  test("when all entities in a constraint category are inaccurate, the whole category no longer applies", () => {
    const overrides = {
      "road.classified": {
        entities: ["Highways_RoadLink.83155"],
        reason:
          "My house is on a corner, and this is not the road that my entry faces",
      },
    };
    const result = handleOverrides(
      DEFAULT_FN,
      mockConstraints,
      overrides,
      defaultIntersectingConstraints,
      defaultNots,
    );

    expect(result["intersectingConstraints"][DEFAULT_FN]).not.toContain(
      "road.classified",
    );
    expect(result["nots"][DEFAULT_FN]).toContain("road.classified");
  });

  test("when less than all entities within a constraint category are inaccurate, the category still applies", () => {
    const overrides = {
      listed: {
        entities: ["31657504"],
        reason: "This is my neighbors building",
      },
    };
    const result = handleOverrides(
      DEFAULT_FN,
      mockConstraints,
      overrides,
      defaultIntersectingConstraints,
      defaultNots,
    );

    expect(result["intersectingConstraints"][DEFAULT_FN]).toContain("listed");
    expect(result["nots"][DEFAULT_FN]).not.toContain("listed");
  });
});

describe("handleOverrides with granular constraint categories (eg listed bldgs, flood zones, designated land)", () => {
  test("when one of two grade II listed building entities are inaccurate, the category and granular child variable still apply", () => {
    const overrides = {
      listed: {
        entities: ["31657504"],
        reason: "This is my neighbors building",
      },
    };
    const result = handleOverrides(
      DEFAULT_FN,
      mockConstraints,
      overrides,
      defaultIntersectingConstraints,
      defaultNots,
    );

    expect(result["intersectingConstraints"][DEFAULT_FN]).toContain("listed");
    expect(result["intersectingConstraints"][DEFAULT_FN]).toContain(
      "listed.gradeTwo",
    );

    expect(result["nots"][DEFAULT_FN]).not.toContain("listed");
    expect(result["nots"][DEFAULT_FN]).not.toContain("listed.gradeTwo");
  });

  test("when flood zone 3 is inaccurate, but flood zone 2 still applies, the category and granular children variables are updated correctly", () => {
    const overrides = {
      flood: {
        entities: ["65106806"],
        reason: "I'm in zone 2, but not zone 3",
      },
    };
    const result = handleOverrides(
      DEFAULT_FN,
      mockConstraints,
      overrides,
      defaultIntersectingConstraints,
      defaultNots,
    );

    expect(result["intersectingConstraints"][DEFAULT_FN]).toContain("flood");
    expect(result["intersectingConstraints"][DEFAULT_FN]).toContain(
      "flood.zoneTwo",
    );
    expect(result["intersectingConstraints"][DEFAULT_FN]).not.toContain(
      "flood.zoneThree",
    );

    expect(result["nots"][DEFAULT_FN]).not.toContain("flood");
    expect(result["nots"][DEFAULT_FN]).not.toContain("flood.zoneTwo");
    expect(result["nots"][DEFAULT_FN]).toContain("flood.zoneThree");
  });

  test("when the only applicable constraint category within designated land is inaccurate, the parent desiganted key also no longer applies", () => {
    const overrides = {
      "designated.conservationArea": {
        entities: ["44006848"],
        reason:
          "I'm on the border of this conservation area, but not doing a project within it",
      },
    };
    const result = handleOverrides(
      DEFAULT_FN,
      mockConstraints,
      overrides,
      defaultIntersectingConstraints,
      defaultNots,
    );

    expect(result["intersectingConstraints"][DEFAULT_FN]).not.toContain(
      "designated.conservationArea",
    );
    expect(result["intersectingConstraints"][DEFAULT_FN]).not.toContain(
      "designated",
    );

    expect(result["nots"][DEFAULT_FN]).toContain("designated.conservationArea");
    expect(result["nots"][DEFAULT_FN]).toContain("designated");
  });

  test("when all entities in a granular constraint category are inaccurate, the whole category and granular child variables no longer apply", () => {
    const overrides = {
      listed: {
        entities: ["31657504", "42101437"],
        reason: "These are both my neighbors building",
      },
    };
    const result = handleOverrides(
      DEFAULT_FN,
      mockConstraints,
      overrides,
      defaultIntersectingConstraints,
      defaultNots,
    );

    expect(result["intersectingConstraints"][DEFAULT_FN]).not.toContain(
      "listed",
    );
    expect(result["intersectingConstraints"][DEFAULT_FN]).not.toContain(
      "listed.gradeTwo",
    );

    expect(result["nots"][DEFAULT_FN]).toContain("listed");
    expect(result["nots"][DEFAULT_FN]).toContain("listed.gradeTwo");
  });
});
