import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

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
  [TYPES.EnhancedTextInput]: "enhanced-text-input",
  [TYPES.ExternalPortal]: "nested-flow",
  [TYPES.Feedback]: "feedback",
  [TYPES.FileUpload]: "file-upload",
  [TYPES.Filter]: "filter",
  [TYPES.FindProperty]: "find-property",
  [TYPES.Flow]: "flow",
  [TYPES.InternalPortal]: "folder",
  [TYPES.FileUploadAndLabel]: "file-upload-and-label",
  [TYPES.List]: "list",
  [TYPES.MapAndLabel]: "map-and-label",
  [TYPES.NextSteps]: "next-steps",
  [TYPES.Notice]: "notice",
  [TYPES.NumberInput]: "number-input",
  [TYPES.Page]: "page",
  [TYPES.Pay]: "pay",
  [TYPES.PlanningConstraints]: "planning-constraints",
  [TYPES.PropertyInformation]: "property-information",
  [TYPES.Answer]: "question",
  [TYPES.Result]: "result",
  [TYPES.Review]: "review",
  [TYPES.Section]: "section",
  [TYPES.Send]: "send",
  [TYPES.SetFee]: "set-fee",
  [TYPES.SetValue]: "set-value",
  [TYPES.Question]: "question",
  [TYPES.ResponsiveChecklist]: "responsive-checklist",
  [TYPES.ResponsiveQuestion]: "responsive-question",
  [TYPES.TaskList]: "task-list",
  [TYPES.TextInput]: "text-input",
} as const;

export const fromSlug = (slug: string): TYPES | undefined => {
  const entry = Object.entries(SLUGS).find(
    ([_typeString, currentSlug]) => currentSlug === slug,
  );

  // TextInput and EnhancedTextInput share a value in order to keep
  // the Select component consistent
  if (entry?.[1] === "enhanced-text-input") return TYPES.TextInput;

  return entry && Number(entry[0]);
};
