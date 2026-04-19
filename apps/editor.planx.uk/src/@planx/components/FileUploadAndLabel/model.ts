import cloneDeep from "lodash/cloneDeep";
import sortBy from "lodash/sortBy";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import { FileWithPath } from "react-dropzone";

import { FileUploadSlot } from "../FileUpload/model";
import { BaseNodeData, MoreInformation, parseBaseNodeData } from "../shared";
import { Condition, Rule } from "../shared/RuleBuilder/types";
import { isRuleMet } from "../shared/RuleBuilder/utils";

export const PASSPORT_REQUESTED_FILES_KEY = "_requestedFiles" as const;

export interface RequestedFile {
  fn: string;
  condition: Condition;
}

export interface FileType {
  name: string;
  fn: string;
  rule: Rule;
  moreInformation?: MoreInformation;
}

export interface FileUploadAndLabel extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
  fileTypes: FileType[];
  hideDropZone?: boolean;
  showDrawingNumber?: boolean;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): FileUploadAndLabel => ({
  title: data?.title || DEFAULT_TITLE,
  description: data?.description || "",
  fn: data?.fn || "",
  fileTypes: cloneDeep(data?.fileTypes) || [newFileType()],
  hideDropZone: data?.hideDropZone || false,
  showDrawingNumber: data?.showDrawingNumber ?? false,
  ...parseBaseNodeData(data),
});

const DEFAULT_TITLE = "Upload and label";

export const newFileType = (): FileType => ({
  name: "",
  fn: "",
  rule: {
    condition: Condition.AlwaysRequired,
  },
});

export interface UserFile extends FileType {
  slots?: FileUploadSlot[];
}

export interface FileUploadAndLabelSlot extends FileUploadSlot {
  tags: string[];
  drawingNumber: string;
}

export interface FormattedUserFile {
  name: string;
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
  passport: Readonly<Store.Passport>;
  fileTypes: FileType[];
}): FileList => {
  const fileList: FileList = { required: [], recommended: [], optional: [] };
  const sortedFileTypes = sortFileTypes(fileTypes);
  const uniqueNames: string[] = [];
  sortedFileTypes.forEach((fileType) => {
    const isUnique = !uniqueNames.includes(fileType.name);
    if (isUnique) {
      const isFileTypeAdded = populateFileList({
        fileList,
        fileType,
        passport,
      });
      if (isFileTypeAdded) uniqueNames.push(fileType.name);
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

/**
 * Populate file list based on condition
 * @returns true if file added, false if not
 */
const populateFileList = ({
  fileList,
  fileType,
  passport,
}: {
  fileList: FileList;
  fileType: FileType;
  passport: Store.Passport;
}): boolean => {
  switch (fileType.rule.condition) {
    case Condition.AlwaysRequired:
      fileList.required.push(fileType);
      return true;

    case Condition.AlwaysRecommended:
      fileList.recommended.push(fileType);
      return true;

    case Condition.RequiredIf:
      if (isRuleMet(passport, fileType.rule)) {
        fileList.required.push(fileType);
        return true;
      }
      return false;

    case Condition.RecommendedIf:
      if (isRuleMet(passport, fileType.rule)) {
        fileList.recommended.push(fileType);
        return true;
      }
      return false;

    case Condition.NotRequired:
      fileList.optional.push(fileType);
      return true;
  }
};

const getUpdatedRequestedFiles = (fileList: FileList) => {
  const { required, recommended, optional } = useStore
    .getState()
    .requestedFiles();

  const uniqueRequired = [
    ...new Set([...required, ...fileList.required.map(({ fn }) => fn)]),
  ];

  const uniqueRecommended = [
    ...new Set([...recommended, ...fileList.recommended.map(({ fn }) => fn)]),
  ];

  const uniqueOptional = [
    ...new Set([...optional, ...fileList.optional.map(({ fn }) => fn)]),
  ];

  return {
    [PASSPORT_REQUESTED_FILES_KEY]: {
      required: uniqueRequired,
      recommended: uniqueRecommended,
      optional: uniqueOptional,
    },
  };
};

/**
 * Generate payload for FileUploadAndLabel breadcrumb
 * Not responsible for validation - this happens at the component level
 */
export const generatePayload = (
  fileList: FileList,
  slots: FileUploadAndLabelSlot[],
): Store.UserData => {
  const newPassportData: Store.UserData["data"] = {};

  const allDefinitions = [
    ...fileList.required,
    ...fileList.recommended,
    ...fileList.optional,
  ];

  slots.forEach((slot) => {
    slot.tags?.forEach((tagName) => {
      const definition = allDefinitions.find(({ name }) => name === tagName);
      if (!definition) return;

      const key = definition.fn;

      // TODO: Helper?
      const formattedFile: FormattedUserFile = {
        name: definition.name,
        rule: definition.rule,
        url: slot.url,
        filename: slot.file.name,
        cachedSlot: {
          ...slot,
          file: {
            path: slot.file.path,
            type: slot.file.type,
            size: slot.file.size,
          },
        },
      };

      if (newPassportData[key]) {
        newPassportData[key].push(formattedFile);
      } else {
        newPassportData[key] = [formattedFile];
      }
    });
  });

  const requestedFiles = getUpdatedRequestedFiles(fileList);

  return {
    data: {
      ...newPassportData,
      ...requestedFiles,
    },
  };
};

export const getRecoveredData = (
  previouslySubmittedData: Store.UserData | undefined,
  fileList: FileList,
): FileUploadAndLabelSlot[] => {
  const allDefinitions = [
    ...fileList.required,
    ...fileList.recommended,
    ...fileList.optional,
  ];

  const recoveredSlotsMap = new Map<string, FileUploadAndLabelSlot>();

  allDefinitions.forEach((def) => {
    const storedFiles = previouslySubmittedData?.data?.[def.fn] as
      | FormattedUserFile[]
      | undefined;

    storedFiles?.forEach((storedFile) => {
      if (storedFile.name === def.name) {
        const slotId = storedFile.cachedSlot.id;

        if (!recoveredSlotsMap.has(slotId)) {
          recoveredSlotsMap.set(slotId, {
            ...(storedFile.cachedSlot as FileUploadAndLabelSlot),
            tags: [def.name],
            // TODO: check out this casting
            drawingNumber:
              (storedFile.cachedSlot as FileUploadAndLabelSlot).drawingNumber ||
              "",
          });
        } else {
          const existingSlot = recoveredSlotsMap.get(slotId)!;
          if (!existingSlot.tags.includes(def.name)) {
            existingSlot.tags.push(def.name);
          }
        }
      }
    });
  });

  return Array.from(recoveredSlotsMap.values());
};
