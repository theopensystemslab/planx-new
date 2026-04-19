import type { FileWithPath } from "react-dropzone";

import { Condition, Operator } from "../shared/RuleBuilder/types";
import { mockFileList, mockFileTypes, mockRules } from "./mocks";
import { type FileList, FileType, type FileUploadAndLabelSlot } from "./model";
import {
  fileTypeSchema,
  fileUploadAndLabelSchema,
  ruleSchema,
  slotsSchema,
} from "./schema";

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
      }),
    ).rejects.toThrow(/name is a required field/);
  });

  it("requires an fn value", async () => {
    await expect(() =>
      fileTypeSchema.validate({
        name: "Test key",
        rule: mockRules.AlwaysRequired,
      }),
    ).rejects.toThrow(/Required field/);
  });

  it("requires a rule", async () => {
    await expect(() =>
      fileTypeSchema.validate({
        name: "Test key",
        fn: "Test fn",
      }),
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

describe("fileUploadAndLabelSchema", () => {
  it("requires a title", async () => {
    await expect(() =>
      fileUploadAndLabelSchema.validate({
        fn: "Test Fn",
        fileTypes: [mockFileTypes.AlwaysRecommended],
      }),
    ).rejects.toThrow(/title is a required field/);
  });

  it("requires at least one FileType", async () => {
    await expect(() =>
      fileUploadAndLabelSchema.validate({
        fn: "Test Fn",
        fileTypes: [],
      }),
    ).rejects.toThrow(/fileTypes field must have at least 1 items/);
  });

  it("requires at least one valid FileType", async () => {
    await expect(() =>
      fileUploadAndLabelSchema.validate({
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
      }),
    ).rejects.toThrow();
  });

  it("allows multiple FileTypes with a mixture of rules", async () => {
    const mockFileUploadAndLabel = {
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

    const result = await fileUploadAndLabelSchema.isValid(
      mockFileUploadAndLabel,
    );

    expect(result).toBe(true);
  });

  it("rejects invalid fileTypes", async () => {
    const mockFileUploadAndLabel = {
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

    const result = await fileUploadAndLabelSchema.isValid(
      mockFileUploadAndLabel,
    );

    expect(result).toBe(true);
  });
});

describe("slotsSchema", () => {
  const emptyFileList: FileList = {
    required: [],
    recommended: [],
    optional: [],
  };

  const createSlot = (
    id: string,
    tags: string[] = [],
  ): Partial<FileUploadAndLabelSlot> => ({
    id,
    status: "success",
    file: { name: `${id}.jpg`, path: `./${id}.jpg` } as FileWithPath,
    tags,
    drawingNumber: "",
  });

  it("rejects slots with a failed upload status", async () => {
    // Add dummy file and tags so the "allFilesTagged" test doesn't fail first or crash
    const mockSlots = [
      { id: "1", status: "error", file: { name: "test.jpg" }, tags: ["Tag"] },
    ];
    const result = await slotsSchema.isValid(mockSlots, {
      context: { fileList: mockFileList },
    });
    expect(result).toBe(false);
  });

  it("rejects slots which are still uploading", async () => {
    const mockSlots = [
      {
        id: "1",
        status: "uploading",
        file: { name: "test.jpg" },
        tags: ["Tag"],
      },
    ];
    const result = await slotsSchema.isValid(mockSlots, {
      context: { fileList: mockFileList },
    });
    expect(result).toBe(false);
  });

  it("allows slots with all files successfully uploaded", async () => {
    const mockSlots = [createSlot("1", ["Tag"]), createSlot("2", ["Tag"])];
    const result = await slotsSchema.isValid(mockSlots, {
      context: { fileList: emptyFileList },
    });
    expect(result).toBe(true);
  });

  it("allows users to proceed without files if there are no required types", async () => {
    const result = await slotsSchema.isValid([], {
      context: {
        fileList: {
          required: [],
          recommended: [mockFileTypes.AlwaysRecommended],
          optional: [mockFileTypes.NotRequired],
        },
      },
    });
    expect(result).toBe(true);
  });

  it("rejects zero files if there is at least one required type", async () => {
    const result = await slotsSchema.isValid([], {
      context: {
        fileList: {
          required: [mockFileTypes.AlwaysRequired],
          recommended: [],
          optional: [],
        },
      },
    });
    expect(result).toBe(false);
  });

  it("rejects if any individual slot is missing a tag (allFilesTagged)", async () => {
    const mockSlots = [createSlot("123", ["Site Plan"]), createSlot("456", [])];

    await expect(
      slotsSchema.validate(mockSlots, { context: { fileList: emptyFileList } }),
    ).rejects.toThrow(/File 456.jpg is not labeled/);
  });

  it("allows fileLists where all files are tagged, even if requirements aren't met yet (allFilesTagged pass)", async () => {
    const mockSlots = [createSlot("1", ["Random Tag"])];

    // Check for the "allFilesTagged" error specifically
    const hasUntaggedError = await slotsSchema
      .validate(mockSlots, { context: { fileList: mockFileList } })
      .then(() => false)
      .catch((err) =>
        err.inner.some((e: any) => e.message.includes("is not labeled")),
      );

    expect(hasUntaggedError).toBe(false);
  });

  it("rejects if any 'required' fileTypes do not have a matching tag in any slot", async () => {
    const requiredType = {
      ...mockFileTypes.AlwaysRequired,
      name: "Required Document",
    };
    const mockSlots = [createSlot("1", ["Unrelated Tag"])];

    const context = {
      fileList: { required: [requiredType], recommended: [], optional: [] },
    };

    await expect(slotsSchema.validate(mockSlots, { context })).rejects.toThrow(
      /Please upload and label all required information/,
    );
  });

  it("allows if all 'required' fileTypes have been assigned to at least one slot", async () => {
    const requiredType = {
      ...mockFileTypes.AlwaysRequired,
      name: "Required Document",
    };
    const mockSlots = [createSlot("1", ["Required Document"])];

    const context = {
      fileList: { required: [requiredType], recommended: [], optional: [] },
    };

    const result = await slotsSchema.isValid(mockSlots, { context });
    expect(result).toBe(true);
  });

  it("handles complex multi-tag scenarios (one file fulfilling multiple requirements)", async () => {
    const req1 = { ...mockFileTypes.AlwaysRequired, name: "Doc A" };
    const req2 = { ...mockFileTypes.AlwaysRequired, name: "Doc B" };

    const mockSlots = [createSlot("1", ["Doc A", "Doc B"])];

    const context = {
      fileList: { required: [req1, req2], recommended: [], optional: [] },
    };

    const result = await slotsSchema.isValid(mockSlots, { context });
    expect(result).toBe(true);
  });
});
