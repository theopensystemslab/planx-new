import { TYPES } from "@planx/components/types";

export const SLUGS: {
  [key in TYPES]: string;
} = {
  [TYPES.AddressInput]: "address-input",
  [TYPES.Checklist]: "checklist",
  [TYPES.Confirmation]: "confirmation",
  [TYPES.ContactInput]: "contact-input",
  [TYPES.Content]: "content",
  [TYPES.Calculate]: "calculate",
  [TYPES.DateInput]: "date-input",
  [TYPES.DrawBoundary]: "draw-boundary",
  [TYPES.ExternalPortal]: "external-portal",
  [TYPES.FileUpload]: "file-upload",
  [TYPES.Filter]: "filter",
  [TYPES.FindProperty]: "find-property-merged",
  [TYPES.Flow]: "flow",
  [TYPES.InternalPortal]: "internal-portal",
  [TYPES.Notice]: "notice",
  [TYPES.NumberInput]: "number-input",
  [TYPES.Pay]: "pay",
  [TYPES.PlanningConstraints]: "planning-constraints",
  [TYPES.PropertyInformation]: "property-information",
  [TYPES.Response]: "question",
  [TYPES.Result]: "result",
  [TYPES.Review]: "review",
  [TYPES.Send]: "send",
  [TYPES.SetValue]: "set-value",
  [TYPES.Statement]: "question",
  [TYPES.TaskList]: "task-list",
  [TYPES.TextInput]: "text-input",
} as const;

export const fromSlug = (slug: string): TYPES | undefined => {
  const entry = Object.entries(SLUGS).find(
    ([_typeString, currentSlug]) => currentSlug === slug
  );
  return entry && Number(entry[0]);
};
