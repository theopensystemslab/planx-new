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
  Portal = 300,
}

// Utility function to make TypeScript detect a non-exhaustive switch statement.
function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here");
}

export const toSlug = (type: TYPES): string => {
  switch (type) {
    case TYPES.Flow:
      return "flow";
    case TYPES.Checklist:
      return "checklist";
    case TYPES.FindProperty:
      return "find-property";
    case TYPES.TaskList:
      return "task-list";
    case TYPES.Notice:
      return "notice";
    case TYPES.TextInput:
      return "text-input";
    case TYPES.Content:
      return "content";
    case TYPES.Result:
      return "result";
    case TYPES.FileUpload:
      return "file-upload";
    case TYPES.Portal:
      return "portal";
    case TYPES.PropertyInformation:
      return "property-information";
    case TYPES.SignIn:
      return "question";
    case TYPES.Report:
      return "question";
    case TYPES.NumberInput:
      return "question";
    case TYPES.DateInput:
      return "question";
    case TYPES.AddressInput:
      return "question";
    case TYPES.Statement:
      return "question";
    case TYPES.Response:
      return "question";
  }
  return assertUnreachable(type);
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
