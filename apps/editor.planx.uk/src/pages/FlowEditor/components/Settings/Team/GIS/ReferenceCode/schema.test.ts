import { validationSchema } from "./schema";

describe("Reference code validation", () => {
  describe("LPA reference codes", () => {
    it("rejects invalid codes", async () => {
      await expect(() =>
        validationSchema.validate({
          referenceCode: "123XYZ",
        }),
      ).rejects.toThrow(/Invalid format for Local Planning Authority reference code/);
    });

    it("accepts a valid code", async () => {
      const result = await validationSchema.isValid({ referenceCode: "ABC" });
      expect(result).toBe(true);
    });
  });

  describe("LPG reference codes", () => {
    it("rejects invalid codes", async () => {
      await expect(() =>
        validationSchema.validate({
          referenceCode: "123-UVWXYZ",
        }),
      ).rejects.toThrow(/Invalid format for Local Planning Group reference code/);
    });

    it("accepts a valid code", async () => {
      const result = await validationSchema.isValid({ referenceCode: "CAB-SCA" });
      expect(result).toBe(true);
    });
  });
});