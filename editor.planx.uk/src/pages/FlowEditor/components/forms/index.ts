import React from "react";

import { SLUGS, TYPES } from "../../data/types";
import Checklist from "./Checklist";
import Content from "./Content";
import ExternalPortal from "./ExternalPortal";
import FileUpload from "./FileUpload";
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
  flow: () => null,
  "find-property": FindProperty,
  "property-information": PropertyInformation,
  "task-list": TaskList,
  "text-input": TextInput,
  notice: Notice,
  "file-upload": FileUpload,
  result: Result,
  checklist: Checklist,
  "external-portal": ExternalPortal,
  "internal-portal": InternalPortal,
  question: Question,
  content: Content,
  pay: Pay,
};

export default components;
