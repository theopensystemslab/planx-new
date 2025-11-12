import { Store } from "pages/FlowEditor/lib/store";
import { FileWithPath } from "react-dropzone";

import { FileUploadSlot } from "../FileUpload/model";
import { Condition, Operator } from "../shared/RuleBuilder/types";
import {
  mockFileList,
  mockFileListManyTagsOneSlot,
  mockFileListMultiple,
  mockFileListWithoutSlots,
  mockFileTypes,
  mockSlot,
  mockSlots,
  mockSlotsMultiple,
} from "./mocks";
import {
  addOrAppendSlots,
  createFileList,
  FileList,
  FileType,
  generatePayload,
  getRecoveredData,
  getTagsForSlot,
  removeSlots,
  resetAllSlots,
  UserFile,
} from "./model";

describe("createFileList function", () => {
  it("adds 'AlwaysRequired' FileTypes to the 'required' array", () => {
    const fileTypes = [mockFileTypes[Condition.AlwaysRequired]];
    const passport: Store.Passport = { data: {} };

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
    const passport: Store.Passport = { data: {} };

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
    const passport: Store.Passport = { data: { testFn: "testVal" } };

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
    const passport: Store.Passport = { data: {} };

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
    const passport: Store.Passport = { data: { testFn: "testVal" } };

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
    const passport: Store.Passport = { data: {} };

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
    const passport: Store.Passport = { data: {} };

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
    const passport: Store.Passport = { data: {} };

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
    const passport: Store.Passport = { data: { testFn: "testVal" } };

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
    const passport: Store.Passport = {
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
    const passport: Store.Passport = {
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
    const passport: Store.Passport = {
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
    const result = generatePayload(mockFileList, mockSlots);

    // Passport data constructed
    expect(result).toHaveProperty("data");

    // fn values mapped as passport keys
    expect(result.data).toHaveProperty("requiredFileFn");
    expect(result.data).toHaveProperty("recommendedFileFn");
    expect(result.data).toHaveProperty("optionalFileFn");

    // Value in passport matches expected shape
    expect(result.data?.requiredFileFn).toMatchObject([
      {
        name: "firstFile",
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

    const result = generatePayload(mockFileListWithEmptySlot, mockSlots);
    expect(result.data).toHaveProperty("requiredFileFn");
    expect(result.data).toHaveProperty("recommendedFileFn");
    expect(result.data).not.toHaveProperty("optionalFileFn");
  });

  it("maps multiple different user uploaded files, tagged as the same fileType, to a single passport key", () => {
    const result = generatePayload(mockFileListMultiple, mockSlotsMultiple);
    expect(result.data).toHaveProperty("fileFn");
    expect(result.data?.fileFn).toHaveLength(3);
    expect(result.data?.fileFn?.[0].filename).toEqual("first.jpg");
    expect(result.data?.fileFn?.[0].name).toEqual("firstFileType");
    expect(result.data?.fileFn?.[1].filename).toEqual("second.jpg");
    expect(result.data?.fileFn?.[1].name).toEqual("firstFileType");
    expect(result.data?.fileFn?.[2].filename).toEqual("third.jpg");
    expect(result.data?.fileFn?.[2].name).toEqual("firstFileType");
  });

  it("correctly generates payload when one file is tagged with multiple file types", () => {
    const singleSlot = {
      file: {
        name: "single-file.pdf",
        path: "./single-file.pdf",
      } as FileWithPath,
      status: "success",
      progress: 1,
      id: "slot-001",
      url: "http://localhost:7002/file/private/xxx/single-file.pdf",
    } as FileUploadSlot;

    const fileListOneSlotMultipleTags: FileList = {
      required: [
        {
          fn: "docTypeA",
          name: "Document A",
          rule: { condition: Condition.AlwaysRequired },
          slots: [singleSlot],
        },
      ],
      recommended: [
        {
          fn: "docTypeB",
          name: "Document B",
          rule: { condition: Condition.AlwaysRecommended },
          slots: [singleSlot],
        },
      ],
      optional: [],
    };

    const result = generatePayload(fileListOneSlotMultipleTags, [singleSlot]);

    expect(result.data).toHaveProperty("docTypeA");

    expect(result.data?.docTypeA).toHaveLength(1);
    expect(result.data?.docTypeA[0].name).toEqual("Document A");
    expect(result.data?.docTypeA[0].filename).toEqual("single-file.pdf");
    expect(result.data?.docTypeA[0].cachedSlot.id).toEqual("slot-001");

    expect(result.data).toHaveProperty("docTypeB");
    expect(result.data?.docTypeB).toHaveLength(1);
    expect(result.data?.docTypeB[0].name).toEqual("Document B");
    expect(result.data?.docTypeB[0].filename).toEqual("single-file.pdf");
    expect(result.data?.docTypeB[0].cachedSlot.id).toEqual("slot-001");
  });

  it("maps the most recent validated slot into the payload", () => {
    // Setup mock of a file list which was tagged whilst the upload was in progress
    const fileListWithUploadingFiles = structuredClone(mockFileList);
    fileListWithUploadingFiles.required[0].slots![0].url = undefined;
    fileListWithUploadingFiles.required[0].slots![0].status = "uploading";
    fileListWithUploadingFiles.required[0].slots![0].progress = 0.5;

    // mockSlots is always validated before generatePayload() is called - it will always contain validates (uploaded) files
    const result = generatePayload(fileListWithUploadingFiles, mockSlots);

    // The validated slot is mapped to the payload, not the state of the slot when it was tagged
    expect(result.data?.requiredFileFn[0].url).toEqual(mockSlots[0].url);
    expect(result.data?.requiredFileFn[0].cachedSlot.status).toEqual(
      mockSlots[0].status,
    );
    expect(result.data?.requiredFileFn[0].cachedSlot.progress).toEqual(
      mockSlots[0].progress,
    );
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
    const previouslySubmittedData: Store.UserData = {
      data: {
        requiredFileFn: [
          {
            name: "firstFile",
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

  it("recovers and matches data by name when multiple file types share the same 'fn'", () => {
    const slot1 = {
      id: "slot-001",
      file: { path: "file1.pdf" },
      status: "success",
    };

    const slot2 = {
      id: "slot-002",
      file: { path: "file2.pdf" },
      status: "success",
    };

    const previouslySubmittedData: Store.UserData = {
      data: {
        otherDocument: [
          {
            name: "file1",
            cachedSlot: slot1,
            rule: { condition: Condition.AlwaysRequired },
            url: "http://example.com/file1.pdf",
            filename: "file1.pdf",
          },
          {
            name: "file2",
            cachedSlot: slot2,
            rule: { condition: Condition.AlwaysRequired },
            url: "http://example.com/file2.pdf",
            filename: "file2.pdf",
          },
        ],
      },
    };

    const fileListToRecover: FileList = {
      required: [
        {
          fn: "otherDocument",
          name: "file1",
          rule: { condition: Condition.AlwaysRequired },
        },
        {
          fn: "otherDocument",
          name: "file2",
          rule: { condition: Condition.AlwaysRequired },
        },
      ],
      recommended: [],
      optional: [],
    };

    const { slots, fileList } = getRecoveredData(
      previouslySubmittedData,
      fileListToRecover,
    );

    // Both slots were recovered
    expect(slots).toHaveLength(2);
    expect(slots.map((s) => s.id)).toContain("slot-001");
    expect(slots.map((s) => s.id)).toContain("slot-002");

    // FileList was correctly populated
    const fileType1 = fileList.required.find((f) => f.name === "file1");
    const fileType2 = fileList.required.find((f) => f.name === "file2");

    // file1 should only have slot1
    expect(fileType1).toHaveProperty("slots");
    expect(fileType1?.slots).toHaveLength(1);
    expect(fileType1?.slots?.[0].id).toEqual("slot-001");

    // file2 should only have slot2
    expect(fileType2).toHaveProperty("slots");
    expect(fileType2?.slots).toHaveLength(1);
    expect(fileType2?.slots?.[0].id).toEqual("slot-002");
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
        name: "first.jpg",
        path: "./first.jpg",
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
