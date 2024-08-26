import {
  ComponentType as TYPES,
  DEFAULT_FLAG_CATEGORY,
} from "@opensystemslab/planx-core/types";
import AddressInput from "@planx/components/AddressInput/Public";
import Calculate from "@planx/components/Calculate/Public";
import Checklist from "@planx/components/Checklist/Public";
import Confirmation from "@planx/components/Confirmation/Public";
import ContactInput from "@planx/components/ContactInput/Public";
import Content from "@planx/components/Content/Public";
import DateInput from "@planx/components/DateInput/Public";
import DrawBoundary from "@planx/components/DrawBoundary/Public";
import FileUpload from "@planx/components/FileUpload/Public";
import FileUploadAndLabel from "@planx/components/FileUploadAndLabel/Public";
import FindProperty from "@planx/components/FindProperty/Public";
import List from "@planx/components/List/Public";
import MapAndLabel from "@planx/components/MapAndLabel/Public";
import NextSteps from "@planx/components/NextSteps/Public";
import Notice from "@planx/components/Notice/Public";
import NumberInput from "@planx/components/NumberInput/Public";
import Pay from "@planx/components/Pay/Public";
import PlanningConstraints from "@planx/components/PlanningConstraints/Public";
import PropertyInformation from "@planx/components/PropertyInformation/Public";
import Question from "@planx/components/Question/Public";
import Result from "@planx/components/Result/Public";
import Review from "@planx/components/Review/Public";
import Section from "@planx/components/Section/Public";
import Send from "@planx/components/Send/Public";
import SetValue from "@planx/components/SetValue/Public";
import TaskList from "@planx/components/TaskList/Public";
import TextInput from "@planx/components/TextInput/Public";
import mapAccum from "ramda/src/mapAccum";
import React from "react";
import { exhaustiveCheck } from "utils";

import type { Store } from "../FlowEditor/lib/store";
import { useStore } from "../FlowEditor/lib/store";

export type handleSubmit = (userData?: Store.userData | Event) => void;

interface Props {
  handleSubmit: handleSubmit;
  node: Store.node;
  data?: any;
}

const Node: React.FC<any> = (props: Props) => {
  const [
    childNodesOf,
    resultData,
    hasPaid,
    passport,
    isFinalCard,
    resetPreview,
    sessionId,
    cachedBreadcrumbs,
    flowName,
    flowSettings,
  ] = useStore((state) => [
    state.childNodesOf,
    state.resultData,
    state.hasPaid(),
    state.computePassport(),
    state.isFinalCard(),
    state.resetPreview,
    state.sessionId,
    state.cachedBreadcrumbs,
    state.flowName,
    state.flowSettings,
  ]);

  const handleSubmit = isFinalCard ? undefined : props.handleSubmit;

  const nodeId = props.node.id;
  const previouslySubmittedData =
    nodeId && cachedBreadcrumbs ? cachedBreadcrumbs[nodeId] : undefined;
  const allProps = {
    id: nodeId,
    ...props.node.data,
    previouslySubmittedData,
    resetPreview,
    handleSubmit,
  };

  switch (props.node.type) {
    case TYPES.Calculate:
      return <Calculate {...allProps} />;

    case TYPES.Checklist: {
      const childNodes = childNodesOf(props.node.id);
      return (
        <Checklist
          {...allProps}
          options={allProps.categories ? undefined : childNodes}
          groupedOptions={
            !allProps.categories
              ? undefined
              : mapAccum(
                  (
                    index: number,
                    category: { title: string; count: number },
                  ) => [
                    index + category.count,
                    {
                      title: category.title,
                      children: childNodes.slice(index, index + category.count),
                    },
                  ],
                  0,
                  allProps.categories,
                )[1]
          }
        />
      );
    }

    case TYPES.Confirmation:
      return <Confirmation {...allProps} />;

    case TYPES.Content:
      return <Content {...allProps} />;

    case TYPES.DateInput:
      return <DateInput {...allProps} />;

    case TYPES.DrawBoundary:
      return <DrawBoundary {...allProps} />;

    case TYPES.FileUpload:
      return <FileUpload {...allProps} />;

    case TYPES.FileUploadAndLabel:
      return <FileUploadAndLabel {...allProps} />;

    case TYPES.FindProperty:
      return <FindProperty {...allProps} />;

    case TYPES.List:
      return <List {...allProps} />;

    case TYPES.MapAndLabel:
      return <MapAndLabel {...allProps} />;

    case TYPES.NextSteps:
      return <NextSteps {...allProps} />;

    case TYPES.Notice:
      return <Notice {...allProps} />;

    case TYPES.NumberInput:
      return <NumberInput {...allProps} />;

    case TYPES.Pay:
      return <Pay {...allProps} />;

    case TYPES.Result: {
      const flagSet = props.node?.data?.flagSet || DEFAULT_FLAG_CATEGORY;
      const data = resultData(flagSet, props.node?.data?.overrides);

      const { flag, responses, displayText } = data[flagSet];

      return (
        <Result
          {...allProps}
          allowChanges={!hasPaid}
          headingColor={{
            text: flag.color,
            background: flag.bgColor,
          }}
          headingTitle={displayText.heading}
          description={displayText.description}
          reasonsTitle="Reasons"
          responses={responses}
          disclaimer={flowSettings?.elements?.legalDisclaimer}
        />
      );
    }

    case TYPES.Review:
      return <Review {...allProps} />;

    case TYPES.Section:
      return <Section {...allProps} />;

    case TYPES.Send:
      return <Send {...allProps} />;

    case TYPES.SetValue:
      return <SetValue {...allProps} />;

    case TYPES.Question:
      return (
        <Question
          {...allProps}
          responses={childNodesOf(props.node.id).map((n, i) => ({
            id: n.id,
            responseKey: i + 1,
            title: n.data?.text,
            ...n.data,
          }))}
        />
      );

    case TYPES.TaskList:
      return (
        <TaskList
          {...allProps}
          tasks={
            // Remove once migrated
            allProps.taskList?.tasks || allProps.tasks
          }
        />
      );

    case TYPES.TextInput:
      return <TextInput {...allProps} />;

    case TYPES.AddressInput:
      return <AddressInput {...allProps} />;

    case TYPES.ContactInput:
      return <ContactInput {...allProps} />;

    case TYPES.PlanningConstraints:
      return <PlanningConstraints {...allProps} />;

    case TYPES.PropertyInformation:
      return <PropertyInformation {...allProps} />;

    case TYPES.ExternalPortal:
    case TYPES.Filter:
    case TYPES.Flow:
    case TYPES.InternalPortal:
    case TYPES.Answer:
    case undefined:
      return null;

    default:
      console.error({ nodeNotFound: props });
      return exhaustiveCheck(props.node.type);
  }
};

export default Node;
