import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { COMPONENT_TITLES } from "@planx/components/shared/componentTitles";

export interface ComponentItem {
  type: TYPES;
  slug: string;
  title: string;
  description: string;
  hasAiVariant?: boolean;
}

export interface Category {
  label: string;
  items: ComponentItem[];
}

const t = (type: TYPES): string => COMPONENT_TITLES[type] ?? String(type);

export const ALL_CATEGORIES: Category[] = [
  {
    label: "Structure",
    items: [
      {
        type: TYPES.Section,
        slug: "section",
        title: t(TYPES.Section),
        description: "Add a navigational section",
      },
      {
        type: TYPES.InternalPortal,
        slug: "folder",
        title: t(TYPES.InternalPortal),
        description: "Add a folder to group nodes",
      },
      {
        type: TYPES.ExternalPortal,
        slug: "nested-flow",
        title: t(TYPES.ExternalPortal),
        description: "Embed another flow",
      },
    ],
  },
  {
    label: "Choice",
    items: [
      {
        type: TYPES.Question,
        slug: "question",
        title: t(TYPES.Question),
        description: "Ask a single-choice question",
      },
      {
        type: TYPES.ResponsiveQuestion,
        slug: "responsive-question",
        title: t(TYPES.ResponsiveQuestion),
        description: "Question with response-dependent follow-ups",
      },
      {
        type: TYPES.Checklist,
        slug: "checklist",
        title: t(TYPES.Checklist),
        description: "Ask which of these apply",
      },
      {
        type: TYPES.ResponsiveChecklist,
        slug: "responsive-checklist",
        title: t(TYPES.ResponsiveChecklist),
        description: "Checklist with follow-up questions",
      },
      {
        type: TYPES.NextSteps,
        slug: "next-steps",
        title: t(TYPES.NextSteps),
        description: "Offer a choice of next steps",
      },
    ],
  },
  {
    label: "Input",
    items: [
      {
        type: TYPES.TextInput,
        slug: "text-input",
        title: t(TYPES.TextInput),
        description:
          "Collect a text response, or AI enhanced project description",
        hasAiVariant: true,
      },
      {
        type: TYPES.NumberInput,
        slug: "number-input",
        title: t(TYPES.NumberInput),
        description: "Collect a numeric response",
      },
      {
        type: TYPES.DateInput,
        slug: "date-input",
        title: t(TYPES.DateInput),
        description: "Collect a date",
      },
      {
        type: TYPES.AddressInput,
        slug: "address-input",
        title: t(TYPES.AddressInput),
        description: "Collect an address",
      },
      {
        type: TYPES.ContactInput,
        slug: "contact-input",
        title: t(TYPES.ContactInput),
        description: "Collect contact details",
      },
      {
        type: TYPES.List,
        slug: "list",
        title: t(TYPES.List),
        description: "Collect groups of multiple inputs",
      },
      {
        type: TYPES.Page,
        slug: "page",
        title: t(TYPES.Page),
        description: "Collect multiple inputs on a single page",
      },
      {
        type: TYPES.Feedback,
        slug: "feedback",
        title: t(TYPES.Feedback),
        description: "Collect user feedback",
      },
    ],
  },
  {
    label: "Upload",
    items: [
      {
        type: TYPES.FileUpload,
        slug: "file-upload",
        title: t(TYPES.FileUpload),
        description: "Upload one or more files",
      },
      {
        type: TYPES.FileUploadAndLabel,
        slug: "file-upload-and-label",
        title: t(TYPES.FileUploadAndLabel),
        description: "Upload and label files",
      },
    ],
  },
  {
    label: "Information",
    items: [
      {
        type: TYPES.Content,
        slug: "content",
        title: t(TYPES.Content),
        description: "Display rich content",
      },
      {
        type: TYPES.Notice,
        slug: "notice",
        title: t(TYPES.Notice),
        description: "Show an important notice",
      },
      {
        type: TYPES.TaskList,
        slug: "task-list",
        title: t(TYPES.TaskList),
        description: "Show a list of tasks",
      },
      {
        type: TYPES.Review,
        slug: "review",
        title: t(TYPES.Review),
        description: "Let the user review and change their answers",
      },
      {
        type: TYPES.Result,
        slug: "result",
        title: t(TYPES.Result),
        description: "Show the result of the flow",
      },
      {
        type: TYPES.Confirmation,
        slug: "confirmation",
        title: t(TYPES.Confirmation),
        description: "Show a confirmation screen",
      },
    ],
  },
  {
    label: "Location",
    items: [
      {
        type: TYPES.FindProperty,
        slug: "find-property",
        title: t(TYPES.FindProperty),
        description: "Search for a property",
      },
      {
        type: TYPES.PropertyInformation,
        slug: "property-information",
        title: t(TYPES.PropertyInformation),
        description: "Show property details",
      },
      {
        type: TYPES.DrawBoundary,
        slug: "draw-boundary",
        title: t(TYPES.DrawBoundary),
        description: "Confirm a red line boundary on a map",
      },
      {
        type: TYPES.PlanningConstraints,
        slug: "planning-constraints",
        title: t(TYPES.PlanningConstraints),
        description: "Show planning constraints",
      },
      {
        type: TYPES.MapAndLabel,
        slug: "map-and-label",
        title: t(TYPES.MapAndLabel),
        description: "Draw and label areas on a map",
      },
    ],
  },
  {
    label: "Data and automations",
    items: [
      {
        type: TYPES.Filter,
        slug: "filter",
        title: t(TYPES.Filter),
        description: "Filter the flow based on conditions",
      },
      {
        type: TYPES.SetValue,
        slug: "set-value",
        title: t(TYPES.SetValue),
        description: "Set a data value in the passport",
      },
      {
        type: TYPES.Calculate,
        slug: "calculate",
        title: t(TYPES.Calculate),
        description: "Calculate a value or fee",
      },
    ],
  },
  {
    label: "Pay and send",
    items: [
      {
        type: TYPES.SetFee,
        slug: "set-fee",
        title: t(TYPES.SetFee),
        description: "Define fee amounts",
      },
      {
        type: TYPES.Pay,
        slug: "pay",
        title: t(TYPES.Pay),
        description: "Collect payment",
      },
      {
        type: TYPES.Send,
        slug: "send",
        title: t(TYPES.Send),
        description: "Send data to an external service",
      },
    ],
  },
];

export const ALL_ITEMS: ComponentItem[] = ALL_CATEGORIES.flatMap(
  (cat) => cat.items,
);
