import { TYPES } from "@planx/components/types";

export const SLUGS = {
  [TYPES.Filter]: "filter",
  [TYPES.Flow]: "flow",
  [TYPES.Checklist]: "checklist",
  [TYPES.FindProperty]: "find-property",
  [TYPES.TaskList]: "task-list",
  [TYPES.Notice]: "notice",
  [TYPES.TextInput]: "text-input",
  [TYPES.Content]: "content",
  [TYPES.Result]: "result",
  [TYPES.FileUpload]: "file-upload",
  [TYPES.InternalPortal]: "internal-portal",
  [TYPES.ExternalPortal]: "external-portal",
  [TYPES.PropertyInformation]: "property-information",
  [TYPES.SignIn]: "question",
  [TYPES.Report]: "question",
  [TYPES.NumberInput]: "question",
  [TYPES.DateInput]: "date-input",
  [TYPES.AddressInput]: "question",
  [TYPES.Statement]: "question",
  [TYPES.Response]: "question",
  [TYPES.Page]: "page",
  [TYPES.Pay]: "pay",
} as const;

export const fromSlug = (slug: string): TYPES | undefined => {
  const entry = Object.entries(SLUGS).find(
    ([_typeString, currentSlug]) => currentSlug === slug
  );
  return entry && Number(entry[0]);
};
