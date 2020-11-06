export enum TYPES {
  Flow = 1,
  SignIn = 2,
  Result = 3,
  Report = 4,
  PropertyInformation = 5,
  FindProperty = 6,
  TaskList = 7,
  Notice = 8,
  Statement = 100, // Question/DropDown
  Checklist = 105,
  TextInput = 110,
  DateInput = 120,
  AddressInput = 130,
  FileUpload = 140,
  NumberInput = 150,
  Response = 200,
  Content = 250,
  InternalPortal = 300,
  ExternalPortal = 310,
  Pay = 400,
  Filter = 500,
}

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
  [TYPES.DateInput]: "question",
  [TYPES.AddressInput]: "question",
  [TYPES.Statement]: "question",
  [TYPES.Response]: "question",
  [TYPES.Pay]: "pay",
} as const;

export const fromSlug = (slug: string): TYPES | undefined => {
  const entry = Object.entries(SLUGS).find(
    ([_typeString, currentSlug]) => currentSlug === slug
  );
  return entry && Number(entry[0]);
};

// Task list

export interface TaskList {
  tasks: Array<Task>;
  notes?: string;
}

export interface Task {
  title: string;
  description: string;
}

// Notice

export interface Notice extends MoreInformation {
  title: string;
  description: string;
  color: string;
  notes?: string;
  resetButton?: boolean;
}

// Checkbox

export interface Group<T> {
  title: string;
  children: Array<T>;
}

export interface Checklist extends MoreInformation {
  fn?: string;
  description?: string;
  text?: string;
  options?: Array<Option>;
  groupedOptions?: Array<Group<Option>>;
  img?: string;
  allRequired?: boolean;
}

interface ChecklistExpandableProps {
  options?: Array<Option>;
  groupedOptions?: Array<Group<Option>>;
}

export const toggleExpandableChecklist = (
  checklist: ChecklistExpandableProps
): ChecklistExpandableProps => {
  if (checklist.options) {
    return {
      ...checklist,
      groupedOptions: [
        {
          title: "Section 1",
          children: checklist.options,
        },
      ],
      options: undefined,
    };
  }
  if (checklist.groupedOptions) {
    return {
      ...checklist,
      options: checklist.groupedOptions.flatMap((opt) => opt.children),
      groupedOptions: undefined,
    };
  }
  return checklist;
};

// Content

export interface Content extends MoreInformation {
  content: string;
}

// Text

export interface TextInput extends MoreInformation {
  title: string;
  description?: string;
  placeholder?: string;
}

// Shared

export interface MoreInformation {
  howMeasured?: string;
  policyRef?: string;
  info?: string;
  notes?: string;
  definitionImg?: string;
}

export interface Option {
  val?: string;
  description?: string;
  id?: string;
  flag?: string;
  text?: string;
  img?: string;
}
