const { squashResultLayers, rollupResultLayers } = require("./helpers");

describe("squashResultLayer helper function", () => {
  test("It should squash the list of layers passed in", () => {
    // Arrange
    const input = {
      "tpo.tenMeterBuffer": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
      "tpo.areas": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
      "tpo.woodland": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
      "tpo.group": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
    };
    const layersToSquash = Object.keys(input);
    const key = "tpo";

    // Act
    const result = squashResultLayers(input, layersToSquash, key);

    // Assert
    expect(result).toHaveProperty(key);
    layersToSquash.forEach(layer => expect(result).not.toHaveProperty(layer));
  });

  test("It should correctly squash layers based on their value", () => {
    // Arrange
    const input1 = {
      "tpo.tenMeterBuffer": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
      "tpo.areas": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: true, // We expect our test to pick this up
        type: "check",
        data: {
          OBJECTID: 123
        },
      },
      "tpo.woodland": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
      "tpo.group": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
    };
    const input2 = {
      "tpo.tenMeterBuffer": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
          OBJECTID: "ABC" // We expect our test to pick this up
        },
      },
      "tpo.areas": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
      "tpo.woodland": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
      "tpo.group": {
        text: "is not in a TPO (Tree Preservation Order) Zone",
        value: false,
        type: "check",
        data: {
        },
      },
    };
    const layersToSquash1 = Object.keys(input1)
    const layersToSquash2 = Object.keys(input2)
    const key = "tpo"

    // Act
    const result1 = squashResultLayers(input1, layersToSquash1, key)
    const result2 = squashResultLayers(input2, layersToSquash2, key)

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
        data: {}
      },
      "listed.grade2": {
        text: "is, or is within, a Listed Building (Grade 2)",
        description: null,
        value: false,
        type: "warning",
        data: {}
      },
      "listed.grade2star": {
        text: "is not in, or within, a Listed Building",
        value: false,
        type: "check",
        data: {}
      },
    };
    const layersToRollup = Object.keys(input);
    const key = "listed";

    // Act
    const result = rollupResultLayers(input, layersToRollup, key)

    // Assert
    expect(result).toHaveProperty(key);
    layersToRollup.forEach(layer => {
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
        data: {}
      },
      "listed.grade2": {
        text: "is, or is within, a Listed Building (Grade 2)",
        description: null,
        value: true,
        type: "warning",
        data: {
          OBJECTID: 3398
        }
      },
      "listed.grade2star": {
        text: "is not in, or within, a Listed Building",
        value: false,
        type: "check",
        data: {}
      },
    };
    const layersToRollup = Object.keys(input);
    const key = "listed";

    // Act
    const result = rollupResultLayers(input, layersToRollup, key)

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
        data: {}
      },
      "listed.grade2": {
        text: "is, or is within, a Listed Building (Grade 2)",
        description: null,
        value: false,
        type: "warning",
        data: {}
      },
      "listed.grade2star": {
        text: "is not in, or within, a Listed Building",
        value: false,
        type: "check",
        data: {}
      },
    };
    const layersToRollup = Object.keys(input);
    const key = "listed";

    // Act
    const result = rollupResultLayers(input, layersToRollup, key)

    // Assert
    expect(result[key]).toMatchObject(input["listed.grade1"]);
  });

});