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

export interface Checklist extends MoreInformation {
  fn?: string;
  description?: string;
  text?: string;
  notes?: string;
  options?: Array<Option>;
  img?: string;
  allRequired?: boolean;
}

// Content

export interface Content extends MoreInformation {
  content: string;
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
