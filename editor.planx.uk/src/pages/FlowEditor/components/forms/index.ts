import React from "react";

import { SLUGS, TYPES } from "../../data/types";
import Checklist from "./Checklist";
import Content from "./Content";
import DateInput from "./DateInput";
import ExternalPortal from "./ExternalPortal";
import FileUpload from "./FileUpload";
import Filter from "./Filter";
import FindProperty from "./FindProperty";
import InternalPortal from "./InternalPortal";
import Notice from "./Notice";
import Pay from "./Pay";
import PropertyInformation from "./PropertyInformation";
import Question from "./Question";
import Result from "./Result";
import TaskList from "./TaskList";
import TextInput from "./TextInput";

const components: {
  [key in typeof SLUGS[TYPES]]: React.FC<any>;
} = {
  checklist: Checklist,
  content: Content,
  "external-portal": ExternalPortal,
  "file-upload": FileUpload,
  filter: Filter,
  "find-property": FindProperty,
  flow: () => null,
  "internal-portal": InternalPortal,
  notice: Notice,
  pay: Pay,
  "property-information": PropertyInformation,
  question: Question,
  result: Result,
  "task-list": TaskList,
  "text-input": TextInput,
  "date-input": DateInput,
};

export default components;
