import { checklistInputValidationSchema, validationSchema } from "./model";

describe("Checklist - validation", () => {
  describe("optional checklist fields in schema", () => {
    const validationSchema = checklistInputValidationSchema({
      data: {
        options: [
          { id: "test1", data: { text: "Test 1", val: "test1" } },
          { id: "test2", data: { text: "Test 2", val: "test2" } },
        ],
        allRequired: true,
      },
      required: false,
    });

    it("does not validate fields without a value", async () => {
      const undefinedResult = await validationSchema.validate(undefined);
      expect(undefinedResult).toBeUndefined();

      const arrayResult = await validationSchema.validate([]);
      expect(arrayResult).toHaveLength(0);
    });

    it("validates optional fields with a value", async () => {
      await expect(() => validationSchema.validate(["test1"])).rejects.toThrow(
        /All options must be checked/
      );
    });
  });
});

describe("Editor validation", () => {
  test("both 'allRequired' and 'exclusiveOr' cannot be toggled on together", async () => {
    await expect(() =>
      validationSchema.validate({
        title: "Test",
        allRequired: true,
        options: [
          {
            id: "a",
            data: { text: "Option A", exclusive: true },
          },
        ],
      })
    ).rejects.toThrow('Cannot configure exclusive "or" option alongside "all required" setting');
  });

  test("only one exclusive option is permitted", async () => {
    await expect(() =>
      validationSchema.validate({
        title: "Test",
        allRequired: false,
        options: [
          {
            id: "a",
            data: { text: "Option A", exclusive: true },
          },
          {
            id: "b",
            data: { text: "Option B", exclusive: true },
          },
        ],
      })
    ).rejects.toThrow(
      "There should be a maximum of one exclusive option configured"
    );
  });
});
