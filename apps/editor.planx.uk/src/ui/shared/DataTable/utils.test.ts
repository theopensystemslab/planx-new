import type { GridFilterItem, ValueOptions } from "@mui/x-data-grid";
import { describe, expect, it } from "vitest";

import { ColumnFilterType } from "./types";
import {
  containsItem,
  dateFormatter,
  getColumnFilterType,
  getValueOptions,
  isValidFilterInput,
} from "./utils";

describe("isValidFilterInput", () => {
  it("returns false when filterItem.value is a string", () => {
    expect(isValidFilterInput({ value: "some string" } as GridFilterItem)).toBe(
      false,
    );
  });

  it("returns false when filterItem.value is an null", () => {
    expect(isValidFilterInput({ value: null } as GridFilterItem)).toBe(false);
  });

  it("returns false when filterItem.value is undefined", () => {
    expect(isValidFilterInput({ value: undefined } as GridFilterItem)).toBe(
      false,
    );
  });

  it("returns false when filterItem.value is an empty array", () => {
    expect(isValidFilterInput({ value: [] } as GridFilterItem)).toBe(false);
  });

  it("returns false when filterItem.value array contains null entries", () => {
    expect(
      isValidFilterInput({
        value: [null, "valid"],
      } as unknown as GridFilterItem),
    ).toBe(false);
    expect(
      isValidFilterInput({
        value: ["valid", null],
      } as unknown as GridFilterItem),
    ).toBe(false);
  });

  it("returns true when filterItem.value is a non-empty array with no nulls", () => {
    expect(
      isValidFilterInput({
        value: ["Apply for prior approval"],
      } as GridFilterItem),
    ).toBe(true);
    expect(
      isValidFilterInput({ value: ["a", "b", "c"] } as GridFilterItem),
    ).toBe(true);
  });
});

describe("containsItem", () => {
  it("returns true for a case-insensitive exact match", () => {
    expect(
      containsItem(
        "Planning Permission",
        "planning permission" as Pick<GridFilterItem, "value">,
      ),
    ).toBe(true);
    expect(
      containsItem(
        "planning permission",
        "Planning Permission" as Pick<GridFilterItem, "value">,
      ),
    ).toBe(true);
  });

  it("returns true for a case-insensitive partial match", () => {
    expect(
      containsItem(
        "Apply for prior approval",
        "prior" as Pick<GridFilterItem, "value">,
      ),
    ).toBe(true);
    expect(
      containsItem(
        "Find out if you need planning permission",
        "PLANNING" as Pick<GridFilterItem, "value">,
      ),
    ).toBe(true);
  });

  it("returns false when there is no match", () => {
    expect(
      containsItem(
        "Apply for prior approval",
        "lawful" as Pick<GridFilterItem, "value">,
      ),
    ).toBe(false);
  });

  it("returns false when value is not a string", () => {
    expect(
      containsItem("some item", ["array"] as Pick<GridFilterItem, "value">),
    ).toBe(false);
    expect(
      containsItem("some item", { nested: "object" } as Pick<
        GridFilterItem,
        "value"
      >),
    ).toBe(false);
    expect(
      containsItem(
        "some item",
        null as unknown as Pick<GridFilterItem, "value">,
      ),
    ).toBe(false);
  });
});

describe("getColumnFilterType", () => {
  it.each([
    [ColumnFilterType.BOOLEAN, "boolean"],
    [ColumnFilterType.DATE, "date"],
    [ColumnFilterType.SINGLE_SELECT, "singleSelect"],
    [ColumnFilterType.ARRAY, undefined],
    [ColumnFilterType.CUSTOM, undefined],
    [undefined, undefined],
  ] as const)(
    "maps ColumnFilterType '%s' to MUI type '%s'",
    (input, expected) => {
      expect(getColumnFilterType(input)).toBe(expected);
    },
  );
});

describe("getValueOptions", () => {
  it("filters null values from an array input", () => {
    expect(
      getValueOptions(["a", null, "b", null, "c"] as ValueOptions[]),
    ).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array when given an empty array", () => {
    expect(getValueOptions([])).toEqual([]);
  });

  it("returns undefined when given a function instead of an array", () => {
    expect(getValueOptions(() => [])).toBeUndefined();
    expect(getValueOptions((_params: unknown) => ["a"])).toBeUndefined();
  });
});

describe("dateFormatter", () => {
  it("formats a date-time string as dd/MM/yy HH:mm:ss", () => {
    expect(dateFormatter("2025-11-24T15:36:17Z")).toBe("24/11/25 15:36:17");
  });

  it("zero-pads day and month values below 10", () => {
    expect(dateFormatter("2025-01-05T09:03:07Z")).toBe("05/01/25 09:03:07");
  });
});
