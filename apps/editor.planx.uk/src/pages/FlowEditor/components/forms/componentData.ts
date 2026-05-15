import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

export interface ComponentItem {
  type: TYPES;
  slug: string;
  title: string;
  description: string;
}

export interface Category {
  label: string;
  items: ComponentItem[];
}

export const ALL_CATEGORIES: Category[] = [
  {
    label: "Question",
    items: [
      {
        type: TYPES.Question,
        slug: "question",
        title: "Question",
        description: "Ask a single-choice question",
      },
      {
        type: TYPES.ResponsiveQuestion,
        slug: "responsive-question",
        title: "Responsive question",
        description: "Question with response-dependent follow-ups",
      },
      {
        type: TYPES.Checklist,
        slug: "checklist",
        title: "Checklist",
        description: "Ask which of these apply",
      },
      {
        type: TYPES.ResponsiveChecklist,
        slug: "responsive-checklist",
        title: "Responsive checklist",
        description: "Checklist with follow-up questions",
      },
      {
        type: TYPES.NextSteps,
        slug: "next-steps",
        title: "Next steps",
        description: "Offer a choice of next steps",
      },
    ],
  },
  {
    label: "Inputs",
    items: [
      {
        type: TYPES.TextInput,
        slug: "text-input",
        title: "Text input",
        description: "Collect a text response",
      },
      {
        type: TYPES.FileUpload,
        slug: "file-upload",
        title: "File upload",
        description: "Upload one or more files",
      },
      {
        type: TYPES.FileUploadAndLabel,
        slug: "file-upload-and-label",
        title: "Upload and label",
        description: "Upload and describe files",
      },
      {
        type: TYPES.NumberInput,
        slug: "number-input",
        title: "Number input",
        description: "Collect a numeric response",
      },
      {
        type: TYPES.DateInput,
        slug: "date-input",
        title: "Date input",
        description: "Collect a date",
      },
      {
        type: TYPES.AddressInput,
        slug: "address-input",
        title: "Address input",
        description: "Collect an address",
      },
      {
        type: TYPES.ContactInput,
        slug: "contact-input",
        title: "Contact input",
        description: "Collect contact details",
      },
      {
        type: TYPES.List,
        slug: "list",
        title: "List",
        description: "Collect a list of items",
      },
      {
        type: TYPES.Page,
        slug: "page",
        title: "Page",
        description: "A page of content and inputs",
      },
      {
        type: TYPES.MapAndLabel,
        slug: "map-and-label",
        title: "Map and label",
        description: "Draw and label areas on a map",
      },
      {
        type: TYPES.Feedback,
        slug: "feedback",
        title: "Feedback",
        description: "Collect user feedback",
      },
    ],
  },
  {
    label: "Information",
    items: [
      {
        type: TYPES.TaskList,
        slug: "task-list",
        title: "Task list",
        description: "Show a list of tasks",
      },
      {
        type: TYPES.Notice,
        slug: "notice",
        title: "Notice",
        description: "Show an important notice",
      },
      {
        type: TYPES.Result,
        slug: "result",
        title: "Result",
        description: "Show the result of the flow",
      },
      {
        type: TYPES.Content,
        slug: "content",
        title: "Content",
        description: "Display rich content",
      },
      {
        type: TYPES.Review,
        slug: "review",
        title: "Review",
        description: "Let the user review their answers",
      },
      {
        type: TYPES.Confirmation,
        slug: "confirmation",
        title: "Confirmation",
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
        title: "Find property",
        description: "Search for a property",
      },
      {
        type: TYPES.PropertyInformation,
        slug: "property-information",
        title: "Property information",
        description: "Show property details",
      },
      {
        type: TYPES.DrawBoundary,
        slug: "draw-boundary",
        title: "Draw boundary",
        description: "Confirm a boundary on a map",
      },
      {
        type: TYPES.PlanningConstraints,
        slug: "planning-constraints",
        title: "Planning constraints",
        description: "Show planning constraints",
      },
    ],
  },
  {
    label: "Navigation",
    items: [
      {
        type: TYPES.Filter,
        slug: "filter",
        title: "Filter",
        description: "Filter the flow based on conditions",
      },
      {
        type: TYPES.ExternalPortal,
        slug: "nested-flow",
        title: "Flow",
        description: "Embed another flow",
      },
      {
        type: TYPES.InternalPortal,
        slug: "folder",
        title: "Folder",
        description: "Group nodes in a folder",
      },
      {
        type: TYPES.Section,
        slug: "section",
        title: "Section",
        description: "Divide the flow into sections",
      },
      {
        type: TYPES.SetValue,
        slug: "set-value",
        title: "Set value",
        description: "Set a data value in the passport",
      },
    ],
  },
  {
    label: "Payment",
    items: [
      {
        type: TYPES.Calculate,
        slug: "calculate",
        title: "Calculate",
        description: "Calculate a value or fee",
      },
      {
        type: TYPES.SetFee,
        slug: "set-fee",
        title: "Set fees",
        description: "Define fee amounts",
      },
      {
        type: TYPES.Pay,
        slug: "pay",
        title: "Pay",
        description: "Collect payment",
      },
    ],
  },
  {
    label: "Outputs",
    items: [
      {
        type: TYPES.Send,
        slug: "send",
        title: "Send",
        description: "Send data to an external service",
      },
    ],
  },
];

export const ALL_ITEMS: ComponentItem[] = ALL_CATEGORIES.flatMap(
  (cat) => cat.items,
);
