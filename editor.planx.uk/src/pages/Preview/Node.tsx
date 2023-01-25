import AddressInput from "@planx/components/AddressInput/Public";
import Calculate from "@planx/components/Calculate/Public";
import Checklist from "@planx/components/Checklist/Public";
import Confirmation from "@planx/components/Confirmation/Public";
import ContactInput from "@planx/components/ContactInput/Public";
import Content from "@planx/components/Content/Public";
import DateInput from "@planx/components/DateInput/Public";
import DrawBoundary from "@planx/components/DrawBoundary/Public";
import FileUpload from "@planx/components/FileUpload/Public";
import FindProperty from "@planx/components/FindProperty/Public";
import Notice from "@planx/components/Notice/Public";
import NumberInput from "@planx/components/NumberInput/Public";
import { GOV_PAY_PASSPORT_KEY } from "@planx/components/Pay/model";
import Pay from "@planx/components/Pay/Public";
import PlanningConstraints from "@planx/components/PlanningConstraints/Public";
import PropertyInformation from "@planx/components/PropertyInformation/Public";
import Question from "@planx/components/Question/Public";
import Result from "@planx/components/Result/Public";
import Review from "@planx/components/Review/Public";
import { getWorkStatus } from "@planx/components/Send/bops";
import Send from "@planx/components/Send/Public";
import SetValue from "@planx/components/SetValue/Public";
import TaskList from "@planx/components/TaskList/Public";
import TextInput from "@planx/components/TextInput/Public";
import { TYPES } from "@planx/components/types";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import { DEFAULT_FLAG_CATEGORY } from "pages/FlowEditor/data/flags";
import mapAccum from "ramda/src/mapAccum";
import React from "react";
import type { FlowSettings, GovUKPayment } from "types";

import type { Store } from "../FlowEditor/lib/store";
import { useStore } from "../FlowEditor/lib/store";

export type handleSubmit = (userData?: Store.userData | Event) => void;

interface Props {
  handleSubmit: handleSubmit;
  node: Store.node;
  settings?: FlowSettings;
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
  ] = useStore((state) => [
    state.childNodesOf,
    state.resultData,
    state.hasPaid(),
    state.computePassport(),
    state.isFinalCard(),
    state.resetPreview,
    state.sessionId,
    state.cachedBreadcrumbs,
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
    case TYPES.Checklist:
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
      const payment: GovUKPayment | undefined =
        passport.data?.[GOV_PAY_PASSPORT_KEY];

      const details = {
        "Planning Application Reference": payment?.reference ?? sessionId,

        "Property Address": passport.data?._address?.title,

        "Application type": [
          // XXX: application type currently hardcoded as it's the only one being
          //      tested, but this will need to become dynamic.
          "Application for a Certificate of Lawfulness",
          getWorkStatus(passport),
        ]
          .filter(Boolean)
          .join(" - "),

        // XXX: If there is no payment we can't alternatively show Date.now() because it
        //      will change after page refresh. BOPS submission time needs to be queryable.
        Submitted: payment?.created_date
          ? new Date(payment.created_date).toLocaleDateString("en-gb", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : undefined,

        "GOV.UK Payment reference": payment?.payment_id,
      };

      return (
        <Confirmation
          {...allProps}
          details={objectWithoutNullishValues(details)}
          color={{ text: "#000", background: "rgba(1, 99, 96, 0.1)" }}
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

    case TYPES.SetValue:
      return <SetValue {...allProps} />;

    case TYPES.Statement:
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
    case TYPES.Response:
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
