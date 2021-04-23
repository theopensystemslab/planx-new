import AddressInput from "@planx/components/AddressInput/Public";
import Calculate from "@planx/components/Calculate/Public";
import Checklist from "@planx/components/Checklist/Public";
import Confirmation from "@planx/components/Confirmation/Public";
import Content from "@planx/components/Content/Public";
import DateInput from "@planx/components/DateInput/Public";
import DrawBoundary from "@planx/components/DrawBoundary/Public";
import FileUpload from "@planx/components/FileUpload/Public";
import FindProperty from "@planx/components/FindProperty/Public";
import Notice from "@planx/components/Notice/Public";
import Notify from "@planx/components/Notify/Public";
import NumberInput from "@planx/components/NumberInput/Public";
import Pay from "@planx/components/Pay/Public";
import Question from "@planx/components/Question/Public";
import Result from "@planx/components/Result/Public";
import Review from "@planx/components/Review/Public";
import Send from "@planx/components/Send/Public";
import TaskList from "@planx/components/TaskList/Public";
import TextInput from "@planx/components/TextInput/Public";
import { TYPES } from "@planx/components/types";
import { DEFAULT_FLAG_CATEGORY } from "pages/FlowEditor/data/flags";
import mapAccum from "ramda/src/mapAccum";
import React from "react";
import { FlowSettings, GovUKPayment } from "types";

import type { Store } from "../FlowEditor/lib/store";
import { useStore } from "../FlowEditor/lib/store";

export type handleSubmit = (
  userData?: Pick<Store.userData, "answers" | "data"> | Event
) => void;

interface Props {
  handleSubmit: handleSubmit;
  node: Store.node;
  settings?: FlowSettings;
  data?: any;
}

const Node: React.FC<any> = (props: Props) => {
  const [childNodesOf, resultData, hasPaid, passport] = useStore((state) => [
    state.childNodesOf,
    state.resultData,
    state.hasPaid(),
    state.passport,
  ]);

  const resetPreview = useStore((state) => state.resetPreview);

  const allProps = {
    id: props.node.id,
    ...props.node.data,
    resetPreview,
    handleSubmit: props.handleSubmit,
  };

  switch (props.node.type) {
    case TYPES.Calculate:
      return <Calculate {...allProps} />;
    case TYPES.Checklist:
      // TODO: sensitive fix for strict mode
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
                    category: { title: string; count: number }
                  ) => [
                    index + category.count,
                    {
                      title: category.title,
                      children: childNodes.slice(index, index + category.count),
                    },
                  ],
                  0,
                  allProps.categories
                )[1]
          }
        />
      );
    case TYPES.Confirmation:
      const payment: GovUKPayment = passport.data.payment;

      return (
        <Confirmation
          {...allProps}
          details={{
            "Planning Application Reference": payment?.reference || "N/A",
            "Property Address": passport.info?.title || "N/A",
            "Application type":
              "Application for a Certificate of Lawfulness - Proposed",
            Submitted: payment?.created_date
              ? new Date(payment.created_date).toLocaleDateString("en-gb", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "N/A",
            "GOV.UK Payment reference": payment?.payment_id || "N/A",
          }}
          color={{ text: "#000", background: "rgba(1, 99, 96, 0.1)" }}
          handleSubmit={(feedback?: string) => {
            feedback?.length &&
              submitFeedback(feedback, {
                reason: "Confirmation",
              });
            props.handleSubmit([props.node.id]);
          }}
        />
      );
    case TYPES.Content:
      return <Content {...allProps} />;

    case TYPES.DateInput:
      return <DateInput {...allProps} />;

    case TYPES.DrawBoundary:
      return <DrawBoundary {...allProps} />;

    case TYPES.FileUpload:
      return <FileUpload {...allProps} />;

    case TYPES.FindProperty:
      return <FindProperty {...allProps} />;

    case TYPES.Notice:
      return <Notice {...allProps} />;

    case TYPES.Notify:
      return <Notify {...allProps} />;

    case TYPES.NumberInput:
      return <NumberInput {...allProps} />;

    case TYPES.Pay:
      return <Pay {...allProps} />;

    case TYPES.Result:
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
          disclaimer={props.settings?.elements?.legalDisclaimer}
        />
      );

    case TYPES.Review:
      return <Review {...allProps} />;

    case TYPES.Send:
      return <Send {...allProps} />;

    case TYPES.Statement:
      // TODO: sensitive fix for strict mode
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

    case TYPES.ExternalPortal:
    case TYPES.Filter:
    case TYPES.Flow:
    case TYPES.InternalPortal:
    case TYPES.Page:
    case TYPES.Report:
    case TYPES.Response:
    case TYPES.SignIn:
    case undefined:
      return null;
    default:
      console.error({ nodeNotFound: props });
      return exhaustiveCheck(props.node.type);
  }
};

function exhaustiveCheck(type: never): never {
  throw new Error(`Missing type ${type}`);
}

export default Node;
