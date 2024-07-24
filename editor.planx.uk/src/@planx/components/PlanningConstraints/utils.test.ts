const fn = "property.constraints.planning";
const constraints = "@todo mock" // use address UNIT SB, 139A, 100, BLACK PRINCE ROAD, LONDON, SE1 7SJ
const originalIntersectingConstraints = { [fn]: ["something", "something.else"] };
const orgiginalNots = { "_nots": { [fn]: ["something", "something.else"] } };

describe("handleOverrides with no inaccurate data", () => {
  test.todo("when no constraints are reported as inaccurate, it returns the original intersections and nots");
});

describe("handleOverrides with non-granular constraint categories", () => {
  test.todo("when all entities in a constraint category are inaccurate, the whole category no longer applies");
    
  test.todo("when a single entity within a constraint category is inaccurate, the category still applies");
});

describe("handleOverrides with granular constraint categories (eg listed bldgs, flood zones, designated land)", () => {
  test.todo("when all entities in a granular constraint category are inaccurate, the whole category and granular child variables no longer apply");

  test.todo("when one of two grade II listed building entities are inaccurate, the category and granular child variable still apply");

  test.todo("when flood zone 3 is inaccurate, but flood zone 2 still applies, the category and granular children variables are updated correctly");

  test.todo("when the only applicable constraint category within designated land is inaccurate, the parent desiganted key also no longer applies");
});
