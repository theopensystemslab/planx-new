import { TextInputType, userDataSchema } from "./model";

describe("validation", () => {
  describe("optional fields", () => {
    const validationSchema = userDataSchema({
      data: { title: "test", type: TextInputType.Email },
      required: false,
    });

    it("does not validate fields without a value", async () => {
      const result = await validationSchema.validate(undefined);
      expect(result).toBeUndefined();
    });

    it("validates optional fields with a value", async () => {
      await expect(() =>
        validationSchema.validate("not a valid email address"),
      ).rejects.toThrow(/Enter an email address in the correct format/);
    });
  });
});
