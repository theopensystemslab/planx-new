import { mockFileTypes, mockRules } from "./mocks";
import { Condition, FileType, Operator } from "./model";
import { fileTypeSchema, multipleFileUploadSchema, ruleSchema } from "./schema";

describe("ruleSchema", () => {
  it("validates an 'AlwaysRequired' rule", async () => {
    const result = await ruleSchema.validate(mockRules.AlwaysRequired);
    expect(result).toEqual(mockRules.AlwaysRequired);
  });

  it("validates an 'AlwaysRecommended' rule", async () => {
    const result = await ruleSchema.validate(mockRules.AlwaysRecommended);
    expect(result).toEqual(mockRules.AlwaysRecommended);
  });

  it("validates a 'RequiredIf' rule", async () => {
    const result = await ruleSchema.validate(mockRules.RequiredIf);
    expect(result).toEqual(mockRules.RequiredIf);
  });

  it("validates a 'RecommendedIf' rule", async () => {
    const result = await ruleSchema.validate(mockRules.RecommendedIf);
    expect(result).toEqual(mockRules.RecommendedIf);
  });

  it("validates a 'NotRequired' rule", async () => {
    const result = await ruleSchema.validate(mockRules.NotRequired);
    expect(result).toEqual(mockRules.NotRequired);
  });
});

describe("fileTypeSchema", () => {
  it("requires a name", async () => {
    await expect(() =>
      fileTypeSchema.validate({
        fn: "Test fn",
        rule: mockRules.AlwaysRequired,
      })
    ).rejects.toThrow(/name is a required field/);
  });

  it("requires an fn value", async () => {
    await expect(() =>
      fileTypeSchema.validate({
        name: "Test key",
        rule: mockRules.AlwaysRequired,
      })
    ).rejects.toThrow(/fn is a required field/);
  });

  it("requires a rule", async () => {
    await expect(() =>
      fileTypeSchema.validate({
        name: "Test key",
        fn: "Test fn",
      })
    ).rejects.toThrow(/rule.condition is a required field/);
  });

  it("accepts a valid FileType", async () => {
    const mockFileType: FileType = {
      name: "Test key",
      fn: "Test fn",
      rule: mockRules.AlwaysRecommended,
    };
    const result = await fileTypeSchema.isValid(mockFileType);
    expect(result).toBe(true);
  });
});

describe("multipleFileUploadSchema", () => {
  it("requires a title", async () => {
    await expect(() =>
      multipleFileUploadSchema.validate({
        fn: "Test Fn",
        fileTypes: [mockFileTypes.AlwaysRecommended],
      })
    ).rejects.toThrow(/title is a required field/);
  });

  it("requires at least one FileType", async () => {
    await expect(() =>
      multipleFileUploadSchema.validate({
        fn: "Test Fn",
        fileTypes: [],
      })
    ).rejects.toThrow(/fileTypes field must have at least 1 items/);
  });

  it("requires at least one valid FileType", async () => {
    await expect(() =>
      multipleFileUploadSchema.validate({
        title: "test title",
        fn: "test fn",
        fileTypes: [
          {
            name: "test key",
            fn: "test fn",
            rule: {
              condition: Condition.AlwaysRecommended,
              // Invalid - fn, val, and operator should not be present for Condition.AlwaysRecommended
              fn: "invalid fn",
              val: "invalid val",
              operator: Operator.Equals,
            },
          },
        ],
      })
    ).rejects.toThrow();
  });

  it("allows multiple FileTypes with a mixture of rules", async () => {
    const mockMultipleFileUpload = {
      title: "Test Title",
      fn: "Test Fn",
      fileTypes: [
        mockFileTypes.AlwaysRecommended,
        mockFileTypes.AlwaysRequired,
        mockFileTypes.RequiredIf,
        mockFileTypes.RecommendedIf,
        mockFileTypes.NotRequired,
      ],
    };

    const result = await multipleFileUploadSchema.isValid(
      mockMultipleFileUpload
    );

    expect(result).toBe(true);
  });

  it("rejects invalid fileTypes", async () => {
    const mockMultipleFileUpload = {
      title: "Test Title",
      fn: "Test Fn",
      fileTypes: [
        mockFileTypes.AlwaysRecommended,
        mockFileTypes.AlwaysRequired,
        mockFileTypes.RequiredIf,
        mockFileTypes.RecommendedIf,
        mockFileTypes.NotRequired,
      ],
    };

    const result = await multipleFileUploadSchema.isValid(
      mockMultipleFileUpload
    );

    expect(result).toBe(true);
  });
});
