import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { getPath } from "./utils";

describe("getPath() helper function", () => {
  test("a non-schema data value to return the correct path for a Page component", () => {
    const result = getPath({
      schemaFn: "zoo",
      dataFn: "myDataValue",
      context: TYPES.Page,
    });

    expect(result).toEqual("zoo.myDataValue");
  });

  test("a non-schema data value to return the correct path for a List component", () => {
    const result = getPath({
      schemaFn: "zoo",
      dataFn: "myDataValue",
      context: TYPES.List,
      index: 5,
    });

    expect(result).toEqual("zoo.six.myDataValue");
  });

  test("a schema data value to return the correct path for a Page component", () => {
    const result = getPath({
      schemaFn: "zoo",
      dataFn: "photographs.existing",
      context: TYPES.Page,
    });

    expect(result).toEqual("photographs.existing");
  });

  test("a schema data value to return the correct path for a List component", () => {
    const result = getPath({
      schemaFn: "zoo",
      dataFn: "photographs.existing",
      context: TYPES.List,
      index: 5,
    });

    expect(result).toEqual("photographs.existing");
  });
});
