import { Store } from "pages/FlowEditor/lib/store";
import { FileWithPath } from "react-dropzone";

import { FileUploadSlot } from "../FileUpload/Public";
import {
  mockFileList,
  mockFileListManyTagsOneSlot,
  mockFileListMultiple,
  mockFileListWithoutSlots,
  mockFileTypes,
  mockSlot,
} from "./mocks";
import {
  addOrAppendSlots,
  Condition,
  ConditionalRule,
  createFileList,
  FileList,
  FileType,
  generatePayload,
  getRecoveredData,
  getTagsForSlot,
  isRuleMet,
  Operator,
  removeSlots,
  resetAllSlots,
  UserFile,
} from "./model";

describe("createFileList function", () => {
  it("adds 'AlwaysRequired' FileTypes to the 'required' array", () => {
    const fileTypes = [mockFileTypes[Condition.AlwaysRequired]];
    const passport: Store.passport = { data: {} };

    const expected: FileList = {
      required: [mockFileTypes[Condition.AlwaysRequired]],
      recommended: [],
      optional: [],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("adds 'AlwaysRecommended' FileTypes to the 'recommended' array", () => {
    const fileTypes = [mockFileTypes[Condition.AlwaysRecommended]];
    const passport: Store.passport = { data: {} };

    const expected: FileList = {
      required: [],
      recommended: [mockFileTypes[Condition.AlwaysRecommended]],
      optional: [],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("adds 'RequiredIf' FileTypes to the 'required' array if the rule is met", () => {
    const fileTypes = [mockFileTypes[Condition.RequiredIf]];
    const passport: Store.passport = { data: { testFn: "testVal" } };

    const expected: FileList = {
      required: [mockFileTypes[Condition.RequiredIf]],
      recommended: [],
      optional: [],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("does not add 'RequiredIf' FileTypes to the 'required' array if the rule is not met", () => {
    const fileTypes = [mockFileTypes[Condition.RequiredIf]];
    const passport: Store.passport = { data: {} };

    const expected: FileList = {
      required: [],
      recommended: [],
      optional: [],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("adds 'RecommendedIf' FileTypes to the 'recommended' array if the rule is met", () => {
    const fileTypes = [mockFileTypes[Condition.RecommendedIf]];
    const passport: Store.passport = { data: { testFn: "testVal" } };

    const expected: FileList = {
      required: [],
      recommended: [mockFileTypes[Condition.RecommendedIf]],
      optional: [],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("does not add 'RecommendedIf' FileTypes to the 'recommended' array if the rule is not met", () => {
    const fileTypes = [mockFileTypes[Condition.RecommendedIf]];
    const passport: Store.passport = { data: {} };

    const expected: FileList = {
      required: [],
      recommended: [],
      optional: [],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("adds 'NotRequired' FileTypes to the 'optional' array", () => {
    const fileTypes = [mockFileTypes[Condition.NotRequired]];
    const passport: Store.passport = { data: {} };

    const expected: FileList = {
      required: [],
      recommended: [],
      optional: [mockFileTypes[Condition.NotRequired]],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("handles unique keys within a single condition", () => {
    const fileTypes = [
      mockFileTypes[Condition.AlwaysRequired],
      mockFileTypes[Condition.AlwaysRequired],
      mockFileTypes[Condition.AlwaysRequired],
    ];
    const passport: Store.passport = { data: {} };

    const expected: FileList = {
      required: [mockFileTypes[Condition.AlwaysRequired]],
      recommended: [],
      optional: [],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("handles unique keys across multiple conditions", () => {
    const fileTypes = [
      mockFileTypes[Condition.AlwaysRequired],
      mockFileTypes[Condition.AlwaysRecommended],
      mockFileTypes[Condition.RequiredIf],
      mockFileTypes[Condition.RecommendedIf],
      mockFileTypes[Condition.NotRequired],
    ];
    const passport: Store.passport = { data: { testFn: "testVal" } };

    const expected: FileList = {
      required: [mockFileTypes[Condition.AlwaysRequired]],
      recommended: [],
      optional: [],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("correctly handles unique file names", () => {
    const fileTypes: FileType[] = [
      {
        fn: "files.documentA",
        name: "Document A",
        rule: {
          fn: "documentA.required",
          val: "true",
          operator: Operator.Equals,
          condition: Condition.RequiredIf,
        },
      },
      {
        fn: "files.documentB",
        name: "Document B",
        rule: {
          fn: "documentB.recommended",
          val: "true",
          operator: Operator.Equals,
          condition: Condition.RecommendedIf,
        },
      },
      {
        fn: "files.documentB",
        name: "Document B",
        rule: {
          fn: "documentB.required",
          val: "true",
          operator: Operator.Equals,
          condition: Condition.RequiredIf,
        },
      },
    ];
    const passport: Store.passport = {
      data: {
        "documentA.required": ["true"],
        "documentB.recommended": ["true"],
      },
    };

    const expected: FileList = {
      required: [
        {
          fn: "files.documentA",
          name: "Document A",
          rule: {
            fn: "documentA.required",
            val: "true",
            operator: Operator.Equals,
            condition: Condition.RequiredIf,
          },
        },
      ],
      recommended: [
        {
          fn: "files.documentB",
          name: "Document B",
          rule: {
            fn: "documentB.recommended",
            val: "true",
            operator: Operator.Equals,
            condition: Condition.RecommendedIf,
          },
        },
      ],
      optional: [],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("handles a complex list of FileTypes", () => {
    const fileTypes: FileType[] = [
      {
        name: "key0",
        fn: "fn0",
        rule: {
          condition: Condition.AlwaysRequired,
        },
      },
      {
        name: "key1",
        fn: "fn1",
        rule: {
          condition: Condition.AlwaysRecommended,
        },
      },
      {
        name: "key2",
        fn: "fn2",
        rule: {
          condition: Condition.RequiredIf,
          operator: Operator.Equals,
          fn: "required.file",
          val: "true",
        },
      },
      {
        name: "key3",
        fn: "fn3",
        rule: {
          condition: Condition.RecommendedIf,
          operator: Operator.Equals,
          fn: "recommended.file",
          val: "true",
        },
      },
      {
        name: "key4",
        fn: "fn4",
        rule: {
          condition: Condition.NotRequired,
        },
      },
    ];
    const passport: Store.passport = {
      data: { "required.file": "true", "recommended.file": ["true"] },
    };

    const expected: FileList = {
      required: [fileTypes[0], fileTypes[2]],
      recommended: [fileTypes[1], fileTypes[3]],
      optional: [fileTypes[4]],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });

  it("handles a complex, unsorted, list of FileTypes", () => {
    const fileTypes: FileType[] = [
      {
        name: "key0",
        fn: "fn0",
        rule: {
          condition: Condition.NotRequired,
        },
      },
      {
        name: "key1",
        fn: "fn1",
        rule: {
          condition: Condition.RecommendedIf,
          operator: Operator.Equals,
          fn: "recommended.file",
          val: "true",
        },
      },
      {
        name: "key2",
        fn: "fn2",
        rule: {
          condition: Condition.RequiredIf,
          operator: Operator.Equals,
          fn: "required.file",
          val: "true",
        },
      },
      {
        name: "key3",
        fn: "fn3",
        rule: {
          condition: Condition.AlwaysRecommended,
        },
      },
      {
        name: "key4",
        fn: "fn4",
        rule: {
          condition: Condition.AlwaysRequired,
        },
      },
      {
        name: "key4",
        fn: "fn4",
        rule: {
          condition: Condition.AlwaysRequired,
        },
      },
      {
        name: "key5",
        fn: "fn5",
        rule: {
          condition: Condition.RequiredIf,
          operator: Operator.Equals,
          fn: "required.file",
          val: "false",
        },
      },
    ];
    const passport: Store.passport = {
      data: { "required.file": "true", "recommended.file": ["true"] },
    };

    const expected: FileList = {
      required: [fileTypes[4], fileTypes[2]],
      recommended: [fileTypes[3], fileTypes[1]],
      optional: [fileTypes[0]],
    };
    const result = createFileList({ passport, fileTypes });

    expect(result).toEqual(expected);
  });
});

describe("generatePayload function", () => {
  it("maps the FileList to the correct format", () => {
    const result = generatePayload(mockFileList);

    // Passport data constructed
    expect(result).toHaveProperty("data");

    // fn values mapped as passport keys
    expect(result.data).toHaveProperty("requiredFileFn");
    expect(result.data).toHaveProperty("recommendedFileFn");
    expect(result.data).toHaveProperty("optionalFileFn");

    // Value in passport matches expected shape
    expect(result.data?.requiredFileFn).toMatchObject([
      {
        url: "http://localhost:7002/file/private/jjpmkz8g/PXL_20230511_093922923.jpg",
        filename: "PXL_20230511_093922923.jpg",
        rule: {
          condition: Condition.AlwaysRequired,
        },
      },
    ]);
  });

  it("ignores files without a slot", () => {
    const mockFileListWithEmptySlot = {
      ...mockFileList,
      optional: [
        {
          ...mockFileList.recommended[0],
          slots: undefined,
        },
      ],
    } as FileList;

    const result = generatePayload(mockFileListWithEmptySlot);
    expect(result.data).toHaveProperty("requiredFileFn");
    expect(result.data).toHaveProperty("recommendedFileFn");
    expect(result.data).not.toHaveProperty("optionalFileFn");
  });

  it("maps multiple different user uploaded files, tagged as the same fileType, to a single passport key", () => {
    const result = generatePayload(mockFileListMultiple);
    expect(result.data).toHaveProperty("fileFn");
    expect(result.data?.fileFn).toHaveLength(3);
    expect(result.data?.fileFn?.[0].filename).toEqual("first.jpg");
    expect(result.data?.fileFn?.[1].filename).toEqual("second.jpg");
    expect(result.data?.fileFn?.[2].filename).toEqual("third.jpg");
  });
});

describe("getRecoveredData function", () => {
  it("recovers a single slot from the passport", () => {
    const mockCachedSlot: NonNullable<UserFile["slots"]>[0]["cachedSlot"] = {
      id: "abc123",
      file: {
        path: "filePath.png",
      } as FileWithPath,
      status: "success",
      progress: 1,
    };

    // Mock breadcrumb data with FileType.fn -> UserFile mapped
    const previouslySubmittedData: Store.userData = {
      data: {
        requiredFileFn: [
          {
            cachedSlot: mockCachedSlot,
          },
        ],
      },
    };

    const { slots: result } = getRecoveredData(
      previouslySubmittedData,
      mockFileList,
    );
    expect(result).toHaveLength(1);
    expect(result?.[0]).toMatchObject(mockCachedSlot);
  });
});

describe("getTagsForSlot function", () => {
  it("returns a list of tags for a slot with one tag", () => {
    const result = getTagsForSlot(mockSlot.id, mockFileList);
    expect(result).toEqual(["thirdFile"]);
  });

  it("returns a list of tags for a slot with many tags", () => {
    const result = getTagsForSlot(mockSlot.id, mockFileListManyTagsOneSlot);
    expect(result).toEqual(["firstFile", "secondFile", "thirdFile"]);
  });

  it("returns an empty array for a slot with no tags", () => {
    const result = getTagsForSlot(mockSlot.id, mockFileListWithoutSlots);
    expect(result).toEqual([]);
  });
});

describe("addOrAppendSlots function", () => {
  it("adds a new slot to a file that does not have any slots yet when one tag is added", () => {
    const result = addOrAppendSlots(
      ["firstFile"],
      mockSlot,
      mockFileListWithoutSlots,
    );

    result.required.map((userFile) => {
      expect(userFile).toHaveProperty("slots");
      expect(userFile?.slots?.[0]).toEqual(mockSlot);
    });

    result.recommended.map((userFile) =>
      expect(userFile).not.toHaveProperty("slots"),
    );
    result.optional.map((userFile) =>
      expect(userFile).not.toHaveProperty("slots"),
    );
  });

  it("adds a new slot to a file that does not have any slots yet when many tags are added", () => {
    const result = addOrAppendSlots(
      ["firstFile", "secondFile", "thirdFile"],
      mockSlot,
      mockFileListWithoutSlots,
    );

    result.required.map((userFile) => {
      expect(userFile).toHaveProperty("slots");
      expect(userFile?.slots?.[0]).toEqual(mockSlot);
    });

    result.recommended.map((userFile) => {
      expect(userFile).toHaveProperty("slots");
      expect(userFile?.slots?.[0]).toEqual(mockSlot);
    });

    result.optional.map((userFile) => {
      expect(userFile).toHaveProperty("slots");
      expect(userFile?.slots?.[0]).toEqual(mockSlot);
    });
  });

  it("adds a new slot to a tagged file that has other existing slots", () => {
    const result = addOrAppendSlots(["secondFile"], mockSlot, mockFileList);

    result.recommended.map((userFile) => {
      expect(userFile).toHaveProperty("slots");
      expect(userFile?.slots).toHaveLength(2);
      expect(userFile?.slots).toContain(mockSlot);
    });
  });

  it("does not duplicate if this file is already tagged with this slot", () => {
    const result = addOrAppendSlots(["thirdFile"], mockSlot, mockFileList);

    result.optional.map((userFile) => {
      expect(userFile).toHaveProperty("slots");
      expect(userFile?.slots).toHaveLength(1);
      expect(userFile?.slots).toEqual([mockSlot]);
    });
  });
});

describe("removeSlots function", () => {
  it("removes a slot from a file with only one slot", () => {
    const result = removeSlots(["thirdFile"], mockSlot, mockFileList);

    result.optional.map((userFile) => {
      expect(userFile).toHaveProperty("slots");
      expect(userFile?.slots).toHaveLength(0);
      expect(userFile?.slots).toEqual([]);
    });
  });

  it("removes the correct slot from a file that has many slots", () => {
    const slot = {
      file: {
        path: "first.jpg",
      },
      status: "success",
      progress: 1,
      id: "001",
      url: "http://localhost:7002/file/private/jjpmkz8g/first.jpg",
    } as FileUploadSlot;
    const result = removeSlots(["firstFileType"], slot, mockFileListMultiple);

    result.required.map((userFile) => {
      expect(userFile).toHaveProperty("slots");
      expect(userFile?.slots).toHaveLength(2);

      expect(userFile?.slots?.map((slot) => slot.id)).not.toContain("001");
      expect(userFile?.slots?.map((slot) => slot.id)).toEqual(["002", "003"]);
    });
  });
});

describe("resetAllSlots function", () => {
  it("removes the `slots` property from all items in a FileList", () => {
    const result = resetAllSlots(mockFileList);

    result.required.map((userFile) =>
      expect(userFile).not.toHaveProperty("slots"),
    );
    result.recommended.map((userFile) =>
      expect(userFile).not.toHaveProperty("slots"),
    );
    result.optional.map((userFile) =>
      expect(userFile).not.toHaveProperty("slots"),
    );
  });
});

describe("isRuleMet function", () => {
  const mockRule: ConditionalRule<Condition.RecommendedIf> = {
    condition: Condition.RecommendedIf,
    val: "testValue",
    fn: "testFn",
    operator: Operator.Equals,
  };

  it("matches on an exact value", () => {
    const mockPassport: Store.passport = { data: { testFn: "testValue" } };
    const result = isRuleMet(mockPassport, mockRule);

    expect(result).toBe(true);
  });

  it("does not match if an exact value is not present", () => {
    const mockPassport: Store.passport = { data: { testFn: "missingValue" } };
    const result = isRuleMet(mockPassport, mockRule);

    expect(result).toBe(false);
  });

  it("does not match if the passport key is not present", () => {
    const mockPassport: Store.passport = {
      data: { missingKey: "missingValue" },
    };
    const result = isRuleMet(mockPassport, mockRule);

    expect(result).toBe(false);
  });

  it("matches on an exact value in an array", () => {
    const mockPassport: Store.passport = {
      data: { testFn: ["value1", "value2", "testValue"] },
    };
    const result = isRuleMet(mockPassport, mockRule);

    expect(result).toBe(true);
  });

  it("matches on an granular value", () => {
    const mockPassport: Store.passport = {
      data: {
        testFn: ["value1.more.value", "value2", "testValue.more.detail"],
      },
    };
    const result = isRuleMet(mockPassport, mockRule);

    expect(result).toBe(true);
  });

  it("does not match on a partial granular value (prefix)", () => {
    const mockPassport: Store.passport = {
      data: { testFn: ["somethingtestValue.more.detail"] },
    };
    const result = isRuleMet(mockPassport, mockRule);

    expect(result).toBe(false);
  });

  it("does not match on a partial granular value (suffix)", () => {
    const mockPassport: Store.passport = {
      data: { testFn: ["testValueSomething.more.detail"] },
    };
    const result = isRuleMet(mockPassport, mockRule);

    expect(result).toBe(false);
  });

  it("does not match on a granular which is not a 'parent'", () => {
    const mockPassport: Store.passport = {
      data: { testFn: ["parent.child.testValue"] },
    };
    const result = isRuleMet(mockPassport, mockRule);

    expect(result).toBe(false);
  });
});
