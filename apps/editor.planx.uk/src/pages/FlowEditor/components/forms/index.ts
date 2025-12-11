import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import AddressInput from "@planx/components/AddressInput/Editor";
import Calculate from "@planx/components/Calculate/Editor";
import Checklist from "@planx/components/Checklist/Editor";
import Confirmation from "@planx/components/Confirmation/Editor";
import ContactInput from "@planx/components/ContactInput/Editor";
import Content from "@planx/components/Content/Editor";
import DateInput from "@planx/components/DateInput/Editor";
import DrawBoundary from "@planx/components/DrawBoundary/Editor";
import ExternalPortal from "@planx/components/ExternalPortal/Editor";
import { FeedbackEditor } from "@planx/components/Feedback/Editor/Editor";
import FileUpload from "@planx/components/FileUpload/Editor";
import FileUploadAndLabel from "@planx/components/FileUploadAndLabel/Editor";
import Filter from "@planx/components/Filter/Editor";
import FindProperty from "@planx/components/FindProperty/Editor";
import InternalPortal from "@planx/components/InternalPortal/Editor";
import List from "@planx/components/List/Editor";
import MapAndLabel from "@planx/components/MapAndLabel/Editor";
import NextSteps from "@planx/components/NextSteps/Editor";
import Notice from "@planx/components/Notice/Editor";
import NumberInput from "@planx/components/NumberInput/Editor";
import Page from "@planx/components/Page/Editor";
import Pay from "@planx/components/Pay/Editor/Editor";
import PlanningConstraints from "@planx/components/PlanningConstraints/Editor";
import PropertyInformation from "@planx/components/PropertyInformation/Editor";
import Question from "@planx/components/Question/Editor";
import ResponsiveChecklist from "@planx/components/ResponsiveChecklist/Editor";
import ResponsiveQuestion from "@planx/components/ResponsiveQuestion/Editor";
import Result from "@planx/components/Result/Editor";
import Review from "@planx/components/Review/Editor";
import Section from "@planx/components/Section/Editor";
import Send from "@planx/components/Send/Editor";
import SetFee from "@planx/components/SetFee/Editor";
import SetValue from "@planx/components/SetValue/Editor";
import TaskList from "@planx/components/TaskList/Editor";
import TextInput from "@planx/components/TextInput/Editor";
import React from "react";

import { SLUGS } from "../../data/types";

const EmptyComponent: React.FC<any> = () => null;

const components: {
  [key in (typeof SLUGS)[TYPES]]: React.FC<any>;
} = {
  "address-input": AddressInput,
  calculate: Calculate,
  checklist: Checklist,
  confirmation: Confirmation,
  "contact-input": ContactInput,
  content: Content,
  "date-input": DateInput,
  "draw-boundary": DrawBoundary,
  "nested-flow": ExternalPortal,
  feedback: FeedbackEditor,
  "file-upload": FileUpload,
  filter: Filter,
  "find-property": FindProperty,
  flow: EmptyComponent,
  folder: InternalPortal,
  "file-upload-and-label": FileUploadAndLabel,
  list: List,
  "map-and-label": MapAndLabel,
  "next-steps": NextSteps,
  notice: Notice,
  "number-input": NumberInput,
  page: Page,
  pay: Pay,
  "planning-constraints": PlanningConstraints,
  "property-information": PropertyInformation,
  question: Question,
  "responsive-checklist": ResponsiveChecklist,
  "responsive-question": ResponsiveQuestion,
  result: Result,
  review: Review,
  section: Section,
  send: Send,
  "set-fee": SetFee,
  "set-value": SetValue,
  "task-list": TaskList,
  "text-input": TextInput,
};

export default components;
