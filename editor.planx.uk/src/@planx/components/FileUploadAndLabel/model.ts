import cloneDeep from "lodash/cloneDeep";
import merge from "lodash/merge";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import { Store } from "pages/FlowEditor/lib/store";
import { FileWithPath } from "react-dropzone";

import { FileUploadSlot } from "../FileUpload/Public";
import { MoreInformation, parseMoreInformation } from "../shared";

/**
 * Conditions which can apply to a rule
 * Order is significant - these represent the hierarchy of these rules
 */
export enum Condition {
  AlwaysRequired = "AlwaysRequired",
  AlwaysRecommended = "AlwaysRecommended",
  RequiredIf = "RequiredIf",
  RecommendedIf = "RecommendedIf",
  NotRequired = "NotRequired",
}

export enum Operator {
  Equals = "Equals",
}

interface SimpleRuleProperties {
  val?: undefined;
  fn?: undefined;
  operator?: undefined;
}

interface ConditionalRuleProperties {
  val: string;
  fn: string;
  operator: Operator;
}

// Mapping of additional rule properties to Condition
type RuleProperties<T extends Condition> = {
  [Condition.AlwaysRequired]: SimpleRuleProperties;
  [Condition.AlwaysRecommended]: SimpleRuleProperties;
  [Condition.RequiredIf]: ConditionalRuleProperties;
  [Condition.RecommendedIf]: ConditionalRuleProperties;
  [Condition.NotRequired]: SimpleRuleProperties;
}[T];

export type ConditionalRule<T extends Condition> = {
  condition: T;
} & RuleProperties<T>;

// Union type of all possible ConditionalRule objects
export type Rule = {
  [T in Condition]: ConditionalRule<T>;
}[Condition];

export interface FileType {
  name: string;
  fn: string;
  rule: Rule;
  moreInformation?: MoreInformation;
}

export interface FileUploadAndLabel extends MoreInformation {
  title: string;
  description?: string;
  fn?: string;
  fileTypes: FileType[];
  hideDropZone?: boolean;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): FileUploadAndLabel => ({
  title: data?.title || DEFAULT_TITLE,
  description: data?.description || "",
  fn: data?.fn || "",
  fileTypes: cloneDeep(data?.fileTypes) || [newFileType()],
  hideDropZone: data?.hideDropZone || false,
  ...parseMoreInformation(data),
});

const DEFAULT_TITLE = "Upload and label";

export const newFileType = (): FileType => ({
  name: "",
  fn: "",
  rule: {
    condition: Condition.AlwaysRequired,
  },
});

export const checkIfConditionalRule = (condition: Condition) =>
  [Condition.RecommendedIf, Condition.RequiredIf].includes(condition);

export interface UserFile extends FileType {
  slots?: FileUploadSlot[];
}

export interface FormattedUserFile {
  rule: Rule;
  url: string | undefined;
  filename: string | undefined;
  cachedSlot: Omit<FileUploadSlot, "file"> & {
    file: Pick<FileWithPath, "path" | "type" | "size">;
  };
}

export interface FileList {
  required: UserFile[];
  recommended: UserFile[];
  optional: UserFile[];
}

export const createFileList = ({
  passport,
  fileTypes,
}: {
  passport: Readonly<Store.passport>;
  fileTypes: FileType[];
}): FileList => {
  const fileList: FileList = { required: [], recommended: [], optional: [] };
  const sortedFileTypes = sortFileTypes(fileTypes);
  const uniqueNames: string[] = [];
  sortedFileTypes.forEach((fileType) => {
    const isUnique = !uniqueNames.includes(fileType.name);
    if (isUnique) {
      uniqueNames.push(fileType.name);
      populateFileList({ fileList, fileType, passport });
    }
  });
  return fileList;
};

const sortFileTypes = (fileTypes: FileType[]): FileType[] => {
  const hierarchyOfConditions = (fileType: FileType) =>
    Object.values(Condition).indexOf(fileType.rule.condition);
  const sortedFileTypes = sortBy(fileTypes, hierarchyOfConditions);
  return sortedFileTypes;
};

const populateFileList = ({
  fileList,
  fileType,
  passport,
}: {
  fileList: FileList;
  fileType: FileType;
  passport: Store.passport;
}) => {
  switch (fileType.rule.condition) {
    case Condition.AlwaysRequired:
      fileList.required.push(fileType);
      break;
    case Condition.AlwaysRecommended:
      fileList.recommended.push(fileType);
      break;
    case Condition.RequiredIf:
      if (isRuleMet(passport, fileType.rule)) {
        fileList.required.push(fileType);
      }
      break;
    case Condition.RecommendedIf:
      if (isRuleMet(passport, fileType.rule)) {
        fileList.recommended.push(fileType);
      }
      break;
    case Condition.NotRequired:
      fileList.optional.push(fileType);
      break;
  }
};

export const isRuleMet = (
  passport: Store.passport,
  rule: ConditionalRule<Condition.RequiredIf | Condition.RecommendedIf>,
): boolean => {
  const passportVal = passport.data?.[rule.fn];
  if (!passportVal) return false;

  const isExactMatch = passportVal === rule.val;
  const isArray = Array.isArray(passportVal);
  const isExactMatchInArray = isArray && passportVal.includes(rule.val);
  const re = new RegExp(`^${rule.val}(\\..+| $)`);
  const isGranularMatchInArray =
    isArray && passportVal.some((value: string) => re.test(value));

  return isExactMatch || isExactMatchInArray || isGranularMatchInArray;
};

interface UserFileWithSlots extends UserFile {
  slots: NonNullable<UserFile["slots"]>;
}

const formatUserFiles = (userFile: UserFileWithSlots): FormattedUserFile[] =>
  userFile.slots.map((slot) => ({
    rule: userFile.rule,
    url: slot.url,
    filename: slot.file.path,
    cachedSlot: {
      ...slot,
      file: {
        path: slot.file.path,
        type: slot.file.type,
        size: slot.file.size,
      },
    },
  }));

/**
 * Type guard to coerce UserFile -> UserFileWithSlot
 */
const hasSlots = (userFile: UserFile): userFile is UserFileWithSlots =>
  Boolean(userFile?.slots);

/**
 * Generate payload for FileUploadAndLabel breadcrumb
 * Not responsible for validation - this happens at the component level
 */
export const generatePayload = (fileList: FileList): Store.userData => {
  const newPassportData: Store.userData["data"] = {};

  const uploadedFiles = [
    ...fileList.required,
    ...fileList.recommended,
    ...fileList.optional,
  ].filter(hasSlots);

  uploadedFiles.forEach((userFile) => {
    newPassportData[userFile.fn] = formatUserFiles(userFile);
  });

  return { data: newPassportData };
};

const getCachedSlotsFromPreviousData = (
  userFile: UserFile,
  previouslySubmittedData: Store.userData | undefined,
): FileUploadSlot[] =>
  previouslySubmittedData?.data?.[userFile.fn]?.map(
    (file: FormattedUserFile) => file.cachedSlot,
  );

const getRecoveredSlots = (
  previouslySubmittedData: Store.userData | undefined,
  fileList: FileList,
) => {
  const allFiles = [
    ...fileList.required,
    ...fileList.recommended,
    ...fileList.optional,
  ];

  const allSlots = allFiles
    .flatMap((userFile) =>
      getCachedSlotsFromPreviousData(userFile, previouslySubmittedData),
    )
    .filter(Boolean);

  const recoveredSlots = uniqBy(allSlots, "id");

  return recoveredSlots;
};

const getRecoveredFileList = (
  previouslySubmittedData: Store.userData | undefined,
  fileList: FileList,
) => {
  const recoveredFileList = cloneDeep(fileList);
  const categories = Object.keys(fileList) as Array<keyof typeof fileList>;

  categories.forEach((category) =>
    recoveredFileList[category].forEach((fileType) => {
      const cachedSlots = getCachedSlotsFromPreviousData(
        fileType,
        previouslySubmittedData,
      );
      if (cachedSlots) fileType.slots = cachedSlots;
    }),
  );

  return recoveredFileList;
};

export const getRecoveredData = (
  previouslySubmittedData: Store.userData | undefined,
  fileList: FileList,
) => {
  const recoveredSlots = getRecoveredSlots(previouslySubmittedData, fileList);
  const recoveredFileList = getRecoveredFileList(
    previouslySubmittedData,
    fileList,
  );

  return { slots: recoveredSlots, fileList: recoveredFileList };
};

export const getTagsForSlot = (
  slotId: FileUploadSlot["id"],
  fileList: FileList,
): string[] => {
  const allFiles = [
    ...fileList.required,
    ...fileList.recommended,
    ...fileList.optional,
  ];

  const tags = allFiles
    .filter((userFile) => userFile?.slots?.some((slot) => slot.id === slotId))
    .map((userFile) => userFile.name);

  return tags;
};

export const addOrAppendSlots = (
  tags: string[],
  uploadedFile: FileUploadSlot,
  fileList: FileList,
): FileList => {
  const updatedFileList: FileList = merge(fileList);
  const categories = Object.keys(updatedFileList) as Array<
    keyof typeof updatedFileList
  >;

  tags.forEach((tag) => {
    categories.forEach((category) => {
      const index = updatedFileList[category].findIndex(
        (fileType) => fileType.name === tag,
      );
      if (index > -1) {
        const updatedFileType = updatedFileList[category][index];
        if (
          updatedFileType.slots &&
          !updatedFileType.slots
            .map((slot) => slot.id)
            .includes(uploadedFile.id)
        ) {
          updatedFileList[category][index].slots?.push(uploadedFile);
        } else {
          updatedFileList[category][index] = {
            ...updatedFileList[category][index],
            slots: [uploadedFile],
          };
        }
      }
    });
  });

  return updatedFileList;
};

export const removeSlots = (
  tags: string[],
  uploadedFile: FileUploadSlot,
  fileList: FileList,
): FileList => {
  const updatedFileList: FileList = merge(fileList);
  const categories = Object.keys(updatedFileList) as Array<
    keyof typeof updatedFileList
  >;

  tags.forEach((tag) => {
    categories.forEach((category) => {
      const index = updatedFileList[category].findIndex(
        (fileType) => fileType.name === tag,
      );
      if (index > -1) {
        const updatedFileType = updatedFileList[category][index];
        if (updatedFileType.slots) {
          const indexToRemove = updatedFileType.slots?.findIndex(
            (slot) => slot.id === uploadedFile.id,
          );
          if (indexToRemove > -1) {
            updatedFileList[category][index].slots?.splice(indexToRemove, 1);
          }
        }
      }
    });
  });

  return updatedFileList;
};

export const resetAllSlots = (fileList: FileList): FileList => {
  const updatedFileList: FileList = merge(fileList);
  const categories = Object.keys(updatedFileList) as Array<
    keyof typeof updatedFileList
  >;

  categories.forEach((category) => {
    updatedFileList[category]
      .filter((userFile) => userFile.slots)
      .forEach((userFile) => delete userFile.slots);
  });

  return updatedFileList;
};
