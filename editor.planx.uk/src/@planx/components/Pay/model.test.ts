import { govPayMetadataSchema } from "./model";

describe("GovPayMetadata Schema", () => {
  const validate = async (payload: unknown) =>
    await govPayMetadataSchema.validate(payload).catch((err) => err.errors);

  const defaults = [
    { key: "flow", value: "flowName" },
    { key: "source", value: "PlanX" },
    { key: "isInviteToPay", value: "true" },
  ];

  test("it requires all default values", async () => {
    const errors = await validate([]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(
      /Keys flow, source and isInviteToPay must be present/,
    );
  });

  test("it allows valid data", async () => {
    const input = [
      ...defaults,
      { key: "someKey", value: "someValue" },
      { key: "someOtherKey", value: "someOtherValue" },
    ];
    const result = await validate(input);

    // No errors, input returned from validation
    expect(result).toEqual(input);
  });

  test("key is required", async () => {
    const input = [...defaults, { value: "abc123" }];
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
      },
    ];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Key length cannot exceed 30 characters/);
  });

  test("value is required", async () => {
    const input = [...defaults, { key: "abc123" }];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Value is a required field/);
  });

  test("value cannot be greater than 100 characters", async () => {
    const input = [
      ...defaults,
      {
        key: "abc123",
        value:
          "this is a very long value which exceeds the one-hundred character limit currently allowed by GovUKPay",
      },
    ];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Value length cannot exceed 100 characters/);
  });

  test("keys must be unique", async () => {
    const input = [
      ...defaults,
      { key: "duplicatedKey", value: "someValue" },
      { key: "duplicatedKey", value: "someOtherValue" },
    ];
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Keys must be unique/);
  });

  test("max 10 entries can be added", async () => {
    const input = [
      ...defaults,
      { key: "four", value: "someValue" },
      { key: "five", value: "someValue" },
      { key: "six", value: "someValue" },
      { key: "seven", value: "someValue" },
      { key: "eight", value: "someValue" },
      { key: "nine", value: "someValue" },
      { key: "ten", value: "someValue" },
    ];

    const result = await validate(input);

    // No errors, input returned from validation
    expect(result).toEqual(input);

    // Try 11 total values
    const errors = await validate([
      ...input,
      { key: "eleven", value: "someValue" },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/A maximum of 10 fields can be set as metadata/);
  });
});
