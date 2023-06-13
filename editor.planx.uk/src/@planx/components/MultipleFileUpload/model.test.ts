import { Store } from "pages/FlowEditor/lib/store";
import { FileWithPath } from "react-dropzone";

import { mockFileList, mockFileTypes } from "./mocks";
import {
  Condition,
  createFileList,
  FileList,
  FileType,
  generatePayload,
  getRecoveredSlots,
  Operator,
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
});

describe("getRecoveredSlots function", () => {
  it("recovers a previously uploaded file from the passport", () => {
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
        requiredFileFn: {
          cachedSlot: mockCachedSlot,
        },
      },
    };

    const result = getRecoveredSlots(previouslySubmittedData, mockFileList);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(mockCachedSlot);
  });
});
