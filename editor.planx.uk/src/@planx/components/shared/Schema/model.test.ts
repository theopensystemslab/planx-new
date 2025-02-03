import {
  mapInputValidationSchema,
  questionInputValidationSchema,
} from "./model";

describe("QuestionField - validation", () => {
  describe("optional fields", () => {
    const validationSchema = questionInputValidationSchema({
      data: {
        title: "test",
        options: [
          { id: "test1", data: { text: "Test 1", val: "test1" } },
          { id: "test2", data: { text: "Test 2", val: "test2" } },
        ],
      },
      required: false,
    });

    it("does not validate fields without a value", async () => {
      const result = await validationSchema.validate(undefined);
      expect(result).toBeUndefined();
    });

    it("validates optional fields with a value", async () => {
      await expect(() =>
        validationSchema.validate("not a valid option"),
      ).rejects.toThrow(/Invalid selection/);
    });
  });
});

describe("MapField - validation", () => {
  describe("optional fields", () => {
    const validationSchema = mapInputValidationSchema({
      data: {
        title: "test",
        fn: "test",
      },
      required: false,
    });

    it("does not validate fields without a value", async () => {
      const result = await validationSchema.validate(undefined);
      expect(result).toBeUndefined();
    });

    it("validates optional fields with a value", async () => {
      await expect(() =>
        validationSchema.validate(["not a valid feature"]),
      ).rejects.toThrow(/Input must be valid GeoJSON/);
    });
  });
});
