import {
  dateInputValidationSchema,
  dateSchema,
  normalizeDate,
  paddedDate,
  parseDate,
} from "./model";

describe("parseDate helper function", () => {
  it("returns a day value", () => {
    const result = parseDate("2024-02-12");
    expect(result.day).toBeDefined();
    expect(result.day).toEqual(12);
  });

  it("returns a month value", () => {
    const result = parseDate("2024-02-12");
    expect(result.month).toBeDefined();
    expect(result.month).toEqual(2);
  });

  it("returns a year value", () => {
    const result = parseDate("2024-02-12");
    expect(result.year).toBeDefined();
    expect(result.year).toEqual(2024);
  });

  it("handles undefined inputs", () => {
    const result = parseDate(undefined);
    expect(result.day).not.toBeDefined();
    expect(result.month).not.toBeDefined();
    expect(result.year).not.toBeDefined();
  });

  it("handles invalid inputs", () => {
    const result = parseDate("not a date");
    expect(result.day).not.toBeDefined();
    expect(result.month).not.toBeDefined();
    expect(result.year).not.toBeDefined();
  });

  it("handles partial inputs", () => {
    const result = parseDate("2024--05");
    expect(result.day).toEqual(5);
    expect(result.month).not.toBeDefined();
    expect(result.year).toEqual(2024);
  });
});

describe("dateSchema", () => {
  test("basic validation", async () => {
    expect(await dateSchema().isValid("2021-03-23")).toBe(true);
    expect(await dateSchema().isValid("2021-23-03")).toBe(false);
  });

  const validate = async (date?: string) =>
    await dateSchema()
      .validate(date)
      .catch((err) => err.errors);

  it("throws an error for an nonsensical value", async () => {
    const errors = await validate("ab-cd-efgh");
    expect(errors[0]).toMatch(/Date must include a day/);
  });

  it("throws an error for a missing day", async () => {
    const errors = await validate("2024-12-");
    expect(errors[0]).toMatch(/Date must include a day/);
  });

  it("throws an error for a missing month", async () => {
    const errors = await validate("2024--25");
    expect(errors[0]).toMatch(/Date must include a month/);
  });

  it("throws an error for a missing year", async () => {
    const errors = await validate("-12-23");
    expect(errors[0]).toMatch(/Date must include a year/);
  });

  it("throws an error for an invalid day", async () => {
    const errors = await validate("2024-12-32");
    expect(errors[0]).toMatch(/Day must be a real day/);
  });

  it("throws an error for an invalid month", async () => {
    const errors = await validate("2024-13-25");
    expect(errors[0]).toMatch(/Month must be a real month/);
  });

  it("throws an error for an invalid month name", async () => {
    const errors = await validate("2024-Novee-25");
    expect(errors[0]).toMatch(/Month must be a real month/);
  });

  it("throws an error for an invalid date (30th Feb)", async () => {
    const errors = await validate("2024-02-30");
    expect(errors[0]).toMatch(/Enter a valid date in DD.MM.YYYY format/);
  });

  it("throws an error for an invalid date (not a leap year)", async () => {
    const errors = await validate("2023-02-29");
    expect(errors[0]).toMatch(/Enter a valid date in DD.MM.YYYY format/);
  });
});

describe("dateInputValidationSchema", () => {
  test("basic validation", async () => {
    expect(
      await dateInputValidationSchema({
        data: {
          title: "test",
          min: "1990-01-01",
          max: "1999-12-31",
        },
        required: true,
      }).isValid("1995-06-15"),
    ).toBe(true);
    expect(
      await dateInputValidationSchema({
        data: {
          title: "test",
          min: "1990-01-01",
          max: "1999-12-31",
        },
        required: true,
      }).isValid("2021-06-15"),
    ).toBe(false);
    expect(
      await dateInputValidationSchema({
        data: {
          title: "test",
          min: "1990-01-01",
          max: "1999-12-31",
        },
        required: true,
      }).isValid("1980-06-15"),
    ).toBe(false);
  });

  describe("optional fields", () => {
    const validationSchema = dateInputValidationSchema({
      data: {
        title: "test",
        min: "1990-01-01",
        max: "1999-12-31",
      },
      required: false,
    });

    it("does not validate fields without a value", async () => {
      const result = await validationSchema.validate(undefined);
      expect(result).toBeUndefined();
    });

    it("validates optional fields with a value", async () => {
      await expect(() =>
        validationSchema.validate("2023-02-29"),
      ).rejects.toThrow(/Enter a valid date in DD.MM.YYYY format/);
    });
  });
});

test("padding on input", () => {
  // Adds zero to single digits greater than 3 on input
  expect(paddedDate("2021-12-6", "input")).toBe("2021-12-06");
  expect(paddedDate("2021-4-22", "input")).toBe("2021-04-22");
  expect(paddedDate("2021-8-4", "input")).toBe("2021-08-04");

  // Leaves valid dates alone
  expect(paddedDate("2021-01-06", "input")).toBe("2021-01-06");
  expect(paddedDate("2021-04-22", "input")).toBe("2021-04-22");
  expect(paddedDate("2021-08-04", "input")).toBe("2021-08-04");

  // Leaves single 0 alone
  expect(paddedDate("2021-0-4", "input")).toBe("2021-0-04");
  expect(paddedDate("2021-10-0", "input")).toBe("2021-10-0");
});

test("padding on blur", () => {
  // Adds zero to single digits less than or equal to 3 on blur
  expect(paddedDate("2021-12-1", "blur")).toBe("2021-12-01");
  expect(paddedDate("2021-3-22", "blur")).toBe("2021-03-22");
  expect(paddedDate("2021-2-2", "blur")).toBe("2021-02-02");

  // Leaves valid dates alone
  expect(paddedDate("2021-01-06", "blur")).toBe("2021-01-06");
  expect(paddedDate("2021-04-22", "blur")).toBe("2021-04-22");
  expect(paddedDate("2021-08-04", "blur")).toBe("2021-08-04");

  // Leaves single 0 alone
  expect(paddedDate("2021-0-2", "blur")).toBe("2021-0-02");
  expect(paddedDate("2021-10-0", "blur")).toBe("2021-10-0");
});

test("normalizes month names", () => {
  // Normalizes full month names
  expect(normalizeDate("2021-November-15")).toBe("2021-11-15");
  expect(normalizeDate("2021-January-01")).toBe("2021-01-01");
  expect(normalizeDate("2021-December-25")).toBe("2021-12-25");

  // Normalizes abbreviated month names
  expect(normalizeDate("2021-Nov-15")).toBe("2021-11-15");
  expect(normalizeDate("2021-Jan-01")).toBe("2021-01-01");
  expect(normalizeDate("2021-Dec-25")).toBe("2021-12-25");

  // Normalizes irrespective of case
  expect(normalizeDate("2021-NOVEMBER-15")).toBe("2021-11-15");
  expect(normalizeDate("2021-november-15")).toBe("2021-11-15");
  expect(normalizeDate("2021-NoVeMbEr-15")).toBe("2021-11-15");
});
