import React from "react";

import { SLUGS, TYPES } from "../../data/types";
import Checklist from "./Checklist";
import Content from "./Content";
import ExternalPortal from "./ExternalPortal";
import FileUpload from "./FileUpload";
import Filter from "./Filter";
import InternalPortal from "./InternalPortal";
import Notice from "./Notice";
import Pay from "./Pay";
import Question from "./Question";
import Result from "./Result";
import TaskList from "./TaskList";
import TextInput from "./TextInput";

const EmptyComponent: React.FC<any> = () => null;

const components: {
  [key in typeof SLUGS[TYPES]]: React.FC<any>;
} = {
  checklist: Checklist,
  content: Content,
  "external-portal": ExternalPortal,
  "file-upload": FileUpload,
  filter: Filter,
  "find-property": EmptyComponent,
  flow: EmptyComponent,
  "internal-portal": InternalPortal,
  notice: Notice,
  pay: Pay,
  "property-information": EmptyComponent,
  question: Question,
  result: Result,
  "task-list": TaskList,
  "text-input": TextInput,
};

export default components;
