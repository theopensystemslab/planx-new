import { Store } from "pages/FlowEditor/lib/store";
import { FileWithPath } from "react-dropzone";

import { FileUploadAndLabelSlot } from "../FileUploadAndLabel/model";
import { Condition, Operator } from "../shared/RuleBuilder/types";
import { mockFileTypes } from "./mocks";
import {
  createFileList,
  FileList,
  FileType,
  generatePayload,
  getRecoveredData,
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
  const mockFileList: FileList = {
    required: [
      {
        fn: "requiredFileFn",
        name: "firstFile",
        rule: { condition: Condition.AlwaysRequired },
      },
    ],
    recommended: [
      {
        fn: "recommendedFileFn",
        name: "secondFile",
        rule: { condition: Condition.AlwaysRecommended },
      },
    ],
    optional: [
      {
        fn: "optionalFileFn",
        name: "thirdFile",
        rule: { condition: Condition.NotRequired },
      },
    ],
  };

  const mockSlots: FileUploadAndLabelSlot[] = [
    {
      id: "slot-1",
      file: {
        name: "PXL_20230511_093922923.jpg",
        path: "./PXL_20230511_093922923.jpg",
      } as FileWithPath,
      status: "success",
      progress: 1,
      url: "http://localhost:7002/file/private/jjpmkz8g/PXL_20230511_093922923.jpg",
      tags: ["firstFile", "secondFile", "thirdFile"],
      drawingNumber: "",
    },
  ];

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
    const slotsMissingOptional: FileUploadAndLabelSlot[] = [
      {
        ...mockSlots[0],
        tags: ["firstFile", "secondFile"],
      },
    ];

    const result = generatePayload(mockFileList, slotsMissingOptional);
    expect(result.data).toHaveProperty("requiredFileFn");
    expect(result.data).toHaveProperty("recommendedFileFn");
    expect(result.data).not.toHaveProperty("optionalFileFn");
  });

  it("maps multiple different user uploaded files, tagged as the same fileType, to a single passport key", () => {
    const mockFileListMultiple: FileList = {
      required: [
        {
          fn: "fileFn",
          name: "firstFileType",
          rule: { condition: Condition.AlwaysRequired },
        },
      ],
      recommended: [],
      optional: [],
    };

    const mockSlotsMultiple: FileUploadAndLabelSlot[] = [
      {
        id: "1",
        file: { name: "first.jpg" } as FileWithPath,
        status: "success",
        progress: 1,
        tags: ["firstFileType"],
        drawingNumber: "",
      },
      {
        id: "2",
        file: { name: "second.jpg" } as FileWithPath,
        status: "success",
        progress: 1,
        tags: ["firstFileType"],
        drawingNumber: "",
      },
      {
        id: "3",
        file: { name: "third.jpg" } as FileWithPath,
        status: "success",
        progress: 1,
        tags: ["firstFileType"],
        drawingNumber: "",
      },
    ];

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
        path: "./single-file.pd",
      } as FileWithPath,
      status: "success",
      progress: 1,
      id: "slot-001",
      url: "http://localhost:7002/file/private/xxx/single-file.pdf",
      tags: ["Document A", "Document B"],
      drawingNumber: "",
    } as FileUploadAndLabelSlot;

    const fileListOneSlotMultipleTags: FileList = {
      required: [
        {
          fn: "docTypeA",
          name: "Document A",
          rule: { condition: Condition.AlwaysRequired },
        },
      ],
      recommended: [
        {
          fn: "docTypeB",
          name: "Document B",
          rule: { condition: Condition.AlwaysRecommended },
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
});

describe("getRecoveredData function", () => {
  it("recovers a single slot from the passport", () => {
    const mockCachedSlot = {
      id: "abc123",
      file: {
        path: "filePath.png",
      } as FileWithPath,
      status: "success",
      progress: 1,
      // Assume the old payload might not have tags directly in the cached slot yet
    };

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

    const mockFileListForRecovery: FileList = {
      required: [
        {
          fn: "requiredFileFn",
          name: "firstFile",
          rule: { condition: Condition.AlwaysRequired },
        },
      ],
      recommended: [],
      optional: [],
    };

    const result = getRecoveredData(
      previouslySubmittedData,
      mockFileListForRecovery,
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

    const slots = getRecoveredData(previouslySubmittedData, fileListToRecover);

    // Both slots were recovered
    expect(slots).toHaveLength(2);
    expect(slots.map((s) => s.id)).toContain("slot-001");
    expect(slots.map((s) => s.id)).toContain("slot-002");

    const recoveredSlot1 = slots.find(({ id }) => id === "slot-001");
    const recoveredSlot2 = slots.find(({ id }) => id === "slot-002");

    expect(recoveredSlot1?.tags).toEqual(["file1"]);
    expect(recoveredSlot2?.tags).toEqual(["file2"]);
  });
});
