import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { AddressInput } from "@planx/components/AddressInput/model";
import AddressInputComponent from "@planx/components/AddressInput/Public";
import type { Calculate } from "@planx/components/Calculate/model";
import CalculateComponent from "@planx/components/Calculate/Public";
import type {
  Checklist,
  ChecklistWithOptions,
} from "@planx/components/Checklist/model";
import ChecklistComponent from "@planx/components/Checklist/Public";
import type { Confirmation } from "@planx/components/Confirmation/model";
import ConfirmationComponent from "@planx/components/Confirmation/Public";
import type { ContactInput } from "@planx/components/ContactInput/model";
import ContactInputComponent from "@planx/components/ContactInput/Public";
import type { Content } from "@planx/components/Content/model";
import ContentComponent from "@planx/components/Content/Public";
import type { DateInput } from "@planx/components/DateInput/model";
import DateInputComponent from "@planx/components/DateInput/Public";
import type { DrawBoundary } from "@planx/components/DrawBoundary/model";
import DrawBoundaryComponent from "@planx/components/DrawBoundary/Public";
import EnhancedTextInputComponent from "@planx/components/EnhancedTextInput/Public";
import type { EnhancedTextInput } from "@planx/components/EnhancedTextInput/types";
import type { Feedback } from "@planx/components/Feedback/model";
import FeedbackComponent from "@planx/components/Feedback/Public/Public";
import type { FileUpload } from "@planx/components/FileUpload/model";
import FileUploadComponent from "@planx/components/FileUpload/Public";
import type { FileUploadAndLabel } from "@planx/components/FileUploadAndLabel/model";
import FileUploadAndLabelComponent from "@planx/components/FileUploadAndLabel/Public";
import type { Props as Filter } from "@planx/components/Filter/Editor";
import FilterComponent from "@planx/components/Filter/Public";
import type { FindProperty } from "@planx/components/FindProperty/model";
import FindPropertyComponent from "@planx/components/FindProperty/Public";
import type { List } from "@planx/components/List/model";
import ListComponent from "@planx/components/List/Public";
import type { MapAndLabel } from "@planx/components/MapAndLabel/model";
import MapAndLabelComponent from "@planx/components/MapAndLabel/Public";
import type { NextSteps } from "@planx/components/NextSteps/model";
import NextStepsComponent from "@planx/components/NextSteps/Public";
import type { Notice } from "@planx/components/Notice/model";
import NoticeComponent from "@planx/components/Notice/Public";
import type { NumberInput } from "@planx/components/NumberInput/model";
import NumberInputComponent from "@planx/components/NumberInput/Public";
import { ConditionalOption, Option } from "@planx/components/Option/model";
import type { Page } from "@planx/components/Page/model";
import PageComponent from "@planx/components/Page/Public";
import type { Pay } from "@planx/components/Pay/model";
import PayComponent from "@planx/components/Pay/Public";
import type { PlanningConstraints } from "@planx/components/PlanningConstraints/model";
import PlanningConstraintsComponent from "@planx/components/PlanningConstraints/Public";
import type { PropertyInformation } from "@planx/components/PropertyInformation/model";
import PropertyInformationComponent from "@planx/components/PropertyInformation/Public";
import type { Question } from "@planx/components/Question/model";
import QuestionComponent from "@planx/components/Question/Public";
import type {
  ResponsiveChecklist,
  ResponsiveChecklistWithOptions,
} from "@planx/components/ResponsiveChecklist/model";
import ResponsiveChecklistComponent from "@planx/components/ResponsiveChecklist/Public";
import type { ResponsiveQuestion } from "@planx/components/ResponsiveQuestion/model";
import ResponsiveQuestionComponent from "@planx/components/ResponsiveQuestion/Public";
import { Result } from "@planx/components/Result/model";
import ResultComponent from "@planx/components/Result/Public";
import type { Review } from "@planx/components/Review/model";
import ReviewComponent from "@planx/components/Review/Public";
import type { Section } from "@planx/components/Section/model";
import SectionComponent from "@planx/components/Section/Public";
import type { Send } from "@planx/components/Send/model";
import SendComponent from "@planx/components/Send/Public";
import type { SetFee } from "@planx/components/SetFee/model";
import SetFeeComponent from "@planx/components/SetFee/Public";
import type { SetValue } from "@planx/components/SetValue/model";
import SetValueComponent from "@planx/components/SetValue/Public";
import type { TaskList } from "@planx/components/TaskList/model";
import TaskListComponent from "@planx/components/TaskList/Public";
import type { TextInput } from "@planx/components/TextInput/model";
import TextInputComponent from "@planx/components/TextInput/Public";
import { hasFeatureFlag } from "lib/featureFlags";
import { AutoAnswerableInputMap } from "pages/FlowEditor/lib/store/preview";
import mapAccum from "ramda/src/mapAccum";
import React from "react";
import { exhaustiveCheck } from "utils";

import type { Store } from "../FlowEditor/lib/store";
import { useStore } from "../FlowEditor/lib/store";

export type HandleSubmit = (userData?: Store.UserData | Event) => void;

interface Props {
  handleSubmit: HandleSubmit;
  node: Store.Node;
  data?: Store.Node["data"];
}

const Node: React.FC<Props> = (props) => {
  const [
    childNodesOf,
    resetPreview,
    cachedBreadcrumbs,
    autoAnswerableFlag,
    autoAnswerableInputs,
    autoAnswerableOptions,
  ] = useStore((state) => [
    state.childNodesOf,
    state.resetPreview,
    state.cachedBreadcrumbs,
    state.autoAnswerableFlag,
    state.autoAnswerableInputs,
    state.autoAnswerableOptions,
  ]);

  const handleSubmit = props.handleSubmit;

  const nodeId = props.node.id;
  const previouslySubmittedData =
    nodeId && cachedBreadcrumbs ? cachedBreadcrumbs[nodeId] : undefined;

  const getComponentProps = <
    TData extends object,
    TComponentType extends keyof AutoAnswerableInputMap = never,
  >() => ({
    id: nodeId,
    previouslySubmittedData,
    resetPreview,
    handleSubmit,
    autoAnswer: nodeId
      ? autoAnswerableInputs<TComponentType>(nodeId)
      : undefined,
    ...(props.node.data as TData),
  });

  switch (props.node.type) {
    case TYPES.AddressInput: {
      return (
        <AddressInputComponent
          {...getComponentProps<AddressInput, TYPES.AddressInput>()}
        />
      );
    }

    case TYPES.Calculate:
      return <CalculateComponent {...getComponentProps<Calculate>()} />;

    case TYPES.Checklist: {
      const checklistProps = getComponentProps<Checklist>();
      const childNodes = childNodesOf(nodeId) as Option[];
      const autoAnswers = nodeId ? autoAnswerableOptions(nodeId) : undefined;
      const groupedOptions = !checklistProps.categories
        ? undefined
        : mapAccum(
            (index: number, category: { title: string; count: number }) => [
              index + category.count,
              {
                title: category.title,
                children:
                  childNodes?.slice(index, index + category.count) || [],
              },
            ],
            0,
            checklistProps.categories,
          )[1];

      // Type narrow to either FlatChecklist or GroupedChecklist
      const props: ChecklistWithOptions = checklistProps.categories
        ? {
            ...checklistProps,
            groupedOptions: groupedOptions!,
            options: undefined,
          }
        : {
            ...checklistProps,
            options: childNodes,
            groupedOptions: undefined,
          };

      return <ChecklistComponent {...props} autoAnswers={autoAnswers} />;
    }

    case TYPES.Confirmation:
      return <ConfirmationComponent {...getComponentProps<Confirmation>()} />;

    case TYPES.ContactInput: {
      return (
        <ContactInputComponent
          {...getComponentProps<ContactInput, TYPES.ContactInput>()}
        />
      );
    }

    case TYPES.Content:
      return <ContentComponent {...getComponentProps<Content>()} />;

    case TYPES.DateInput: {
      return (
        <DateInputComponent
          {...getComponentProps<DateInput, TYPES.DateInput>()}
        />
      );
    }

    case TYPES.DrawBoundary:
      return <DrawBoundaryComponent {...getComponentProps<DrawBoundary>()} />;

    case TYPES.EnhancedTextInput:
      return (
        <EnhancedTextInputComponent
          {...getComponentProps<EnhancedTextInput>()}
        />
      );

    case TYPES.Feedback:
      return <FeedbackComponent {...getComponentProps<Feedback>()} />;

    case TYPES.FileUpload:
      return <FileUploadComponent {...getComponentProps<FileUpload>()} />;

    case TYPES.FileUploadAndLabel:
      return (
        <FileUploadAndLabelComponent
          {...getComponentProps<FileUploadAndLabel>()}
        />
      );

    case TYPES.Filter: {
      const filterProps = getComponentProps<Filter>();
      const autoAnswer = nodeId ? autoAnswerableFlag(nodeId) : undefined;

      return <FilterComponent {...filterProps} autoAnswer={autoAnswer} />;
    }

    case TYPES.FindProperty:
      return <FindPropertyComponent {...getComponentProps<FindProperty>()} />;

    case TYPES.List:
      return <ListComponent {...getComponentProps<List>()} />;

    case TYPES.MapAndLabel:
      return <MapAndLabelComponent {...getComponentProps<MapAndLabel>()} />;

    case TYPES.NextSteps:
      return <NextStepsComponent {...getComponentProps<NextSteps>()} />;

    case TYPES.Notice:
      return <NoticeComponent {...getComponentProps<Notice>()} />;

    case TYPES.NumberInput: {
      return (
        <NumberInputComponent
          {...getComponentProps<NumberInput, TYPES.NumberInput>()}
        />
      );
    }

    case TYPES.Page:
      return <PageComponent {...getComponentProps<Page>()} />;

    case TYPES.Pay:
      return <PayComponent {...getComponentProps<Pay>()} />;

    case TYPES.PlanningConstraints:
      return (
        <PlanningConstraintsComponent
          {...getComponentProps<PlanningConstraints>()}
        />
      );

    case TYPES.PropertyInformation:
      return (
        <PropertyInformationComponent
          {...getComponentProps<PropertyInformation>()}
        />
      );

    case TYPES.Question: {
      const questionProps = getComponentProps<Question>();
      const autoAnswers = nodeId ? autoAnswerableOptions(nodeId) : undefined;
      const options = childNodesOf(nodeId) as Option[];

      return (
        <QuestionComponent
          {...questionProps}
          options={options}
          autoAnswers={autoAnswers}
        />
      );
    }

    case TYPES.ResponsiveChecklist: {
      const baseProps = getComponentProps<ResponsiveChecklist>();
      const childNodes = childNodesOf(nodeId) as ConditionalOption[];
      const groupedOptions = !baseProps.categories
        ? undefined
        : mapAccum(
            (index: number, category: { title: string; count: number }) => [
              index + category.count,
              {
                title: category.title,
                children:
                  childNodes?.slice(index, index + category.count) || [],
              },
            ],
            0,
            baseProps.categories,
          )[1];

      // Type narrow to either FlatChecklist or GroupedChecklist
      const props: ResponsiveChecklistWithOptions = baseProps.categories
        ? {
            ...baseProps,
            groupedOptions: groupedOptions!,
            options: undefined,
          }
        : {
            ...baseProps,
            options: childNodes,
            groupedOptions: undefined,
          };

      return <ResponsiveChecklistComponent {...props} />;
    }

    case TYPES.ResponsiveQuestion: {
      const props = getComponentProps<ResponsiveQuestion>();
      const options = childNodesOf(nodeId) as ConditionalOption[];

      return <ResponsiveQuestionComponent {...props} options={options} />;
    }

    case TYPES.Result:
      return <ResultComponent {...getComponentProps<Result>()} />;

    case TYPES.Review:
      return <ReviewComponent {...getComponentProps<Review>()} />;

    case TYPES.Section:
      return <SectionComponent {...getComponentProps<Section>()} />;

    case TYPES.Send:
      return <SendComponent {...getComponentProps<Send>()} />;

    case TYPES.SetFee:
      return <SetFeeComponent {...getComponentProps<SetFee>()} />;

    case TYPES.SetValue:
      return <SetValueComponent {...getComponentProps<SetValue>()} />;

    case TYPES.TaskList: {
      const taskListProps = getComponentProps<TaskList>();

      return (
        <TaskListComponent
          {...taskListProps}
          tasks={taskListProps.taskList?.tasks || taskListProps.tasks}
        />
      );
    }

    case TYPES.TextInput: {
      return (
        <TextInputComponent
          {...getComponentProps<TextInput, TYPES.TextInput>()}
        />
      );
    }

    // These types are never seen by users, nor do they leave their own breadcrumbs entry
    case TYPES.Answer:
    case TYPES.ExternalPortal:
    case TYPES.Flow:
    case TYPES.InternalPortal:
    case undefined:
      return null;

    default:
      console.error({ nodeNotFound: props });
      return exhaustiveCheck(props.node.type);
  }
};

export default Node;
