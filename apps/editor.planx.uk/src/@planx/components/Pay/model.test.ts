import { govPayMetadataSchema, parsePay } from "./model";

describe("GovPayMetadata Schema", () => {
  const validate = async (payload: unknown) =>
    await govPayMetadataSchema.validate(payload).catch((err) => err.errors);

  const defaults = [
    { key: "flow", value: "flowName", type: "static" },
    { key: "source", value: "PlanX", type: "static" },
    { key: "paidViaInviteToPay", value: "paidViaInviteToPay", type: "data" },
  ];

  test("it requires all default values", async () => {
    const errors = await validate([]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(
      /Keys flow, source and paidViaInviteToPay must be present/,
    );
  });

  test("it allows valid data", async () => {
    const input = [
      ...defaults,
      { key: "someKey", value: "someValue", type: "static" },
      { key: "someOtherKey", value: "someOtherValue", type: "static" },
    ];
    const result = await validate(input);

    // No errors, input returned from validation
    expect(result).toEqual(input);
  });

  test("key is required", async () => {
    const input = [...defaults, { value: "abc123", type: "static" }];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Key is a required field/);
  });

  test("key cannot be greater than 30 characters", async () => {
    const input = [
      ...defaults,
      {
        key: "this is a very long key which exceeds the amount allowed by GovPay",
        value: "def456",
        type: "static",
      },
    ];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Key length cannot exceed 30 characters/);
  });

  test("value is required", async () => {
    const input = [...defaults, { key: "abc123", type: "data" }];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Value is a required field/);
  });

  test("type is required", async () => {
    const input = [...defaults, { key: "abc123", value: "def456" }];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Type is a required field/);
  });

  test("static values cannot be greater than 100 characters", async () => {
    const input = [
      ...defaults,
      {
        key: "abc123",
        value:
          "this is a very long value which exceeds the one-hundred character limit currently allowed by GovUKPay",
        type: "static",
      },
    ];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Value length cannot exceed 100 characters/);
  });

  test("dynamic passport value can be greater than 100 characters", async () => {
    const input = [
      ...defaults,
      {
        key: "myPassportVariable",
        value:
          "thisIsAVeryLongPassportVariable.itsUnlikelyToHappenButWeDontNeedToRestrict.theDynamicValueThisReadsWillBeTruncatedAtTimeOfSubmission",
        type: "data",
      },
    ];
    const result = await validate(input);

    // No errors, input returned from validation
    expect(result).toEqual(input);
  });

  test("keys must be unique", async () => {
    const input = [
      ...defaults,
      { key: "duplicatedKey", value: "someValue", type: "static" },
      { key: "duplicatedKey", value: "someOtherValue", type: "static" },
    ];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Keys must be unique/);
  });

  test("max 15 entries can be added", async () => {
    const input = [
      ...defaults,
      { value: "someValue", type: "static", key: "four" },
      { value: "someValue", type: "static", key: "five" },
      { value: "someValue", type: "static", key: "six" },
      { value: "someValue", type: "static", key: "seven" },
      { value: "someValue", type: "static", key: "eight" },
      { value: "someValue", type: "static", key: "nine" },
      { value: "someValue", type: "static", key: "ten" },
      { value: "someValue", type: "static", key: "eleven" },
      { value: "someValue", type: "static", key: "twelve" },
      { value: "someValue", type: "static", key: "thirteen" },
      { value: "someValue", type: "static", key: "fourteen" },
      { value: "someValue", type: "static", key: "fifteen" },
    ];

    const result = await validate(input);

    // No errors, input returned from validation
    expect(result).toEqual(input);

    // Try 16 total values - i.e. one more than permitted
    const errors = await validate([
      ...input,
      { key: "sixteen", value: "someValue" },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/A maximum of 15 fields can be set as metadata/);
  });
});

describe("parsePay() helper function", () => {
  describe("govPayMetadata mapping", () => {
    it("handles new nodes", () => {
      const result = parsePay();

      expect(result.govPayMetadata).toHaveLength(3);
      expect(result.govPayMetadata[0]).toHaveProperty("type", "static");
      expect(result.govPayMetadata[1]).toHaveProperty("type", "static");
      expect(result.govPayMetadata[2]).toHaveProperty("type", "data");
    });

    it("handles existing nodes", () => {
      const result = parsePay({
        govPayMetadata: [
          {
            key: "flow",
            value: "flow name here",
            type: "static",
          },
          {
            key: "source",
            value: "PlanX",
            type: "static",
          },
          {
            key: "paidViaInviteToPay",
            value: "paidViaInviteToPay",
            type: "data",
          },
        ],
      });

      expect(result.govPayMetadata).toHaveLength(3);
      expect(result.govPayMetadata[0]).toHaveProperty("type", "static");
      expect(result.govPayMetadata[1]).toHaveProperty("type", "static");
      expect(result.govPayMetadata[2].value).toEqual("paidViaInviteToPay");
      expect(result.govPayMetadata[2]).toHaveProperty("type", "data");
    });
  });
});
