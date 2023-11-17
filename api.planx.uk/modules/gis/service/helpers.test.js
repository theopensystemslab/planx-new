import {
  squashResultLayers,
  rollupResultLayers,
  getA4Subvariables,
} from "./helpers";

describe("squashResultLayer helper function", () => {
  test("It should squash the list of layers passed in", () => {
    // Arrange
    const input = {
      "tpo.tenMeterBuffer": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
      "tpo.areas": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
      "tpo.woodland": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
      "tpo.group": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
    };
    const layersToSquash = Object.keys(input);
    const key = "tpo";

    // Act
    const result = squashResultLayers(input, layersToSquash, key);

    // Assert
    expect(result).toHaveProperty(key);
    layersToSquash.forEach((layer) => expect(result).not.toHaveProperty(layer));
  });

  test("It should correctly squash layers based on their value", () => {
    // Arrange
    const input1 = {
      "tpo.tenMeterBuffer": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
      "tpo.areas": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: true, // We expect our test to pick this up
        type: "check",
        data: {
          OBJECTID: 123,
        },
      },
      "tpo.woodland": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
      "tpo.group": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
    };
    const input2 = {
      "tpo.tenMeterBuffer": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
          OBJECTID: "ABC", // We expect our test to pick this up
        },
      },
      "tpo.areas": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
      "tpo.woodland": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
      "tpo.group": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {},
      },
    };
    const layersToSquash1 = Object.keys(input1);
    const layersToSquash2 = Object.keys(input2);
    const key = "tpo";

    // Act
    const result1 = squashResultLayers(input1, layersToSquash1, key);
    const result2 = squashResultLayers(input2, layersToSquash2, key);

    // Assert
    expect(result1[key].value).toBe(true);
    expect(result1[key]).toMatchObject(input1["tpo.areas"]);
    expect(result2[key].value).toBe(false);
    expect(result2[key]).toMatchObject(input2["tpo.tenMeterBuffer"]);
  });
});

describe("rollupResultLayer helper function", () => {
  test("It should roll up the list of layers passed in", () => {
    // Arrange
    const input = {
      "listed.grade1": {
        text: "is not in, or within, a Listed Building",
        value: false,
        type: "check",
        data: {},
      },
      "listed.grade2": {
        text: "is, or is within, a Listed Building (Grade 2)",
        description: null,
        value: false,
        type: "warning",
        data: {},
      },
      "listed.grade2star": {
        text: "is not in, or within, a Listed Building",
        value: false,
        type: "check",
        data: {},
      },
    };
    const layersToRollup = Object.keys(input);
    const key = "listed";

    // Act
    const result = rollupResultLayers(input, layersToRollup, key);

    // Assert
    expect(result).toHaveProperty(key);
    layersToRollup.forEach((layer) => {
      // Jest can handle paths using dot notation, so keys with a dot need to be wrapped in []
      expect(result).toHaveProperty([layer]);
      expect(result[layer]).toMatchObject({ value: false });
    });
  });

  test("It should correctly roll up layers which have a match", () => {
    // Arrange
    const input = {
      "listed.grade1": {
        text: "is not in, or within, a Listed Building",
        value: false,
        type: "check",
        data: {},
      },
      "listed.grade2": {
        text: "is, or is within, a Listed Building (Grade 2)",
        description: null,
        value: true,
        type: "warning",
        data: {
          OBJECTID: 3398,
        },
      },
      "listed.grade2star": {
        text: "is not in, or within, a Listed Building",
        value: false,
        type: "check",
        data: {},
      },
    };
    const layersToRollup = Object.keys(input);
    const key = "listed";

    // Act
    const result = rollupResultLayers(input, layersToRollup, key);

    // Assert
    expect(result[key]).toMatchObject(input["listed.grade2"]);
  });

  test("It should correctly roll up layers which have do not have a match", () => {
    // Arrange
    const input = {
      "listed.grade1": {
        text: "is not in, or within, a Listed Building",
        value: false,
        type: "check",
        data: {},
      },
      "listed.grade2": {
        text: "is, or is within, a Listed Building (Grade 2)",
        description: null,
        value: false,
        type: "warning",
        data: {},
      },
      "listed.grade2star": {
        text: "is not in, or within, a Listed Building",
        value: false,
        type: "check",
        data: {},
      },
    };
    const layersToRollup = Object.keys(input);
    const key = "listed";

    // Act
    const result = rollupResultLayers(input, layersToRollup, key);

    // Assert
    expect(result[key]).toMatchObject(input["listed.grade1"]);
  });

  test("It should correctly rollup when the layerName matches a provided layer", () => {
    // Arrange
    const input = {
      article4: {
        text: "is subject to local permitted development restrictions (known as Article 4 directions)",
        description:
          "BLACKFRIARS STREET 28,29,30, KING STREET 10 TO 15, MILL LANE 19,20",
        value: true,
        type: "warning",
        data: {
          OBJECTID: 72963,
          REF: "Article 4 Direction 1985",
          LOCATION_1:
            "BLACKFRIARS STREET 28,29,30, KING STREET 10 TO 15, MILL LANE 19,20",
          DESCRIPTIO: "Effective 29 November 1985",
        },
      },
      "article4.canterbury.hmo": {
        text: "is subject to local permitted development restrictions (known as Article 4 directions)",
        description: "Canterbury and surrounding area",
        value: true,
        type: "warning",
        data: {
          OBJECTID: 73412,
          REF: "The Canterbury HMO Article 4 D",
          LOCATION_1: "Canterbury and surrounding area",
          DESCRIPTIO: "Effective 25 February 2016",
        },
      },
    };
    const layersToRollup = Object.keys(input);
    const key = "article4";

    // Act
    const result = rollupResultLayers(input, layersToRollup, key);

    // Assert
    expect(result[key]).toMatchObject(input["article4"]); // parent key maintains all original properties
    expect(result["article4.canterbury.hmo"]).toMatchObject({ value: true }); // granular key is simplified
  });
});

describe("getA4Subvariables helper function", () => {
  const A4_KEY = "OBJECTID";
  const articleFours = {
    "article4.test.a": 1,
    "article4.test.b": 5,
    "article4.test.c": 13,
  };
  it("returns a property for each Article 4 passed in", () => {
    // Arrange
    const features = [
      { attributes: { OBJECTID: 1, name: "Hackney Road" } },
      { attributes: { OBJECTID: 5, name: "Peckham Way" } },
      { attributes: { OBJECTID: 13, name: "Chelsea Park" } },
    ];
    // Act
    const result = getA4Subvariables(features, articleFours, A4_KEY);
    // Assert
    Object.keys(articleFours).forEach((key) =>
      expect(result).toHaveProperty([key]),
    );
  });

  it("correctly matches features which have a hit on an Article 4", () => {
    // Arrange
    const features = [
      { attributes: { OBJECTID: 1, name: "Hackney Road" } },
      { attributes: { OBJECTID: 13, name: "Chelsea Park" } },
    ];
    // Act
    const result = getA4Subvariables(features, articleFours, A4_KEY);
    // Assert
    expect(result).toMatchObject({
      ["article4.test.a"]: { value: true },
      ["article4.test.b"]: { value: false },
      ["article4.test.c"]: { value: true },
    });
  });

  it("handles no matching Article 4 results", () => {
    const result = getA4Subvariables([], articleFours, A4_KEY);
    expect(result).toMatchObject({
      ["article4.test.a"]: { value: false },
      ["article4.test.b"]: { value: false },
      ["article4.test.c"]: { value: false },
    });
  });
});
