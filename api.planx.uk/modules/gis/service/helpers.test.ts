import { type PlanxConstraint } from "@opensystemslab/planx-core/types";
import {
  getActivePlanningDataConstraints,
  renameArticle4CAZ,
} from "./helpers.js";

const baseSchema = getActivePlanningDataConstraints();

describe.todo("add intersections");

describe.todo("add _nots");

describe.todo("add `designated` variable");

describe.todo("set granular `designated.nationalPark.broads`");

describe.todo("add flood zones");

describe.todo("add listed building grades");

describe.todo("add article 4s");

describe("rename `article4.caz` based on local authority", () => {
  test("renames correctly for a one-word local authority", () => {
    const mockIncomingResult: PlanxConstraint = {
      "articleFour.caz": {
        value: false,
      },
    };
    const result = renameArticle4CAZ("lambeth", baseSchema, mockIncomingResult);

    expect(result).toEqual({
      "articleFour.lambeth.caz": {
        value: false,
      },
    });
  });

  test("renames correctly for a hyphenated local authority", () => {
    const mockIncomingResult: PlanxConstraint = {
      "articleFour.caz": {
        value: false,
      },
    };
    const result = renameArticle4CAZ(
      "west-berkshire",
      baseSchema,
      mockIncomingResult,
    );

    expect(result).toEqual({
      "articleFour.westBerkshire.caz": {
        value: false,
      },
    });
  });

  test("if parent a4 is false but caz is true, syncs caz data to parent", () => {
    const mockIncomingResult: PlanxConstraint = {
      articleFour: {
        value: false,
      },
      "articleFour.caz": {
        value: true,
        text: "is in the Central Activities Zone",
        data: [
          {
            entity: 1,
            dataset: "central-activities-zone",
            name: "Downtown",
          },
        ],
      },
    };
    const result = renameArticle4CAZ(
      "st-albans",
      baseSchema,
      mockIncomingResult,
    );

    expect(result).toEqual({
      articleFour: {
        fn: "articleFour",
        value: true,
        text: "is in an Article 4 direction area",
        data: [
          {
            entity: 1,
            dataset: "central-activities-zone",
            name: "Downtown",
          },
        ],
        category: "General policy",
      },
      "articleFour.stAlbans.caz": {
        value: true,
        text: "is in the Central Activities Zone",
        data: [
          {
            entity: 1,
            dataset: "central-activities-zone",
            name: "Downtown",
          },
        ],
      },
    });
  });
});
