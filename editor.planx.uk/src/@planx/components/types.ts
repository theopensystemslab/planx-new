export enum TYPES {
  Flow = 1,
  SignIn = 2,
  Result = 3,
  Report = 4,
  PropertyInformation = 5,
  FindProperty = 6,
  TaskList = 7,
  Notice = 8,
  // XXX: We're merging components 5 (PropertyInformation) and 6 (FindProperty) into 9 (FindPropertyMerged).
  //      Here's what will happen:
  //        1. Add 9 (this PR)
  //        2. Edit all flows to replace 5 and 6 with 9
  //        3. Remove 5 and 6 from the codebase, and rename 9 to FindProperty (second PR)
  FindPropertyMerged = 9,
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
  Page = 350,
  Pay = 400,
  Filter = 500,
  Review = 600,
  Notify = 625,
  Send = 650,
}
