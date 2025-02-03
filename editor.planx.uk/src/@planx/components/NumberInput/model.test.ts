import { numberInputValidationSchema } from "./model";

describe("validation", () => {
  describe("optional number fields in schema", () => {
    const validationSchema = numberInputValidationSchema({
      data: { title: "test", isInteger: true },
      required: false,
    });

    it("does not validate fields without a value", async () => {
      const result = await validationSchema.validate(undefined);
      expect(result).toBeUndefined();
    });

    it("validates optional fields with a value", async () => {
      await expect(() =>
        validationSchema.validate("not a number"),
      ).rejects.toThrow(/Enter a positive number/);

      await expect(() => validationSchema.validate("12.34")).rejects.toThrow(
        /Enter a whole number/,
      );
    });
  });
});
