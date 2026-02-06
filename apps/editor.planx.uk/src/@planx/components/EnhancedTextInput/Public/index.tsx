import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { getPreviouslySubmittedData } from "@planx/components/shared/utils";
import { useIsFetching } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { useState } from "react";

import type { TaskComponentMap } from "../types";
import InitialUserInput from "./InitialUserInput";
import ProjectDescription from "./Tasks/ProjectDescription";
import type { FormValues, Props } from "./types";
import { getValidationSchema, makeBreadcrumb } from "./utils";

const taskComponents: TaskComponentMap = {
  projectDescription: ProjectDescription,
};

const EnhancedTextInputComponent = (props: Props) => {
  const previous = getPreviouslySubmittedData(props);
  const [step, setStep] = useState<"input" | "task">("input");
  const isRunningTask = useIsFetching({ queryKey: [props.task] });

  const initialValues: FormValues = previous
    ? {
        userInput: previous,
        status: "success",
        original:
          props.previouslySubmittedData?.data?._enhancements[props.fn].original,
        enhanced:
          props.previouslySubmittedData?.data?._enhancements[props.fn].enhanced,
        error: null,
        selectedOption: null,
        customDescription: "",
      }
    : {
        userInput: "",
        status: "idle",
        enhanced: null,
        error: null,
        selectedOption: null,
        customDescription: "",
      };

  const nextStep = (values: FormValues) => {
    // If re-submitting the same value (e.g. as part of "back" navigation),
    // just submit and do not re-query the API
    if (values.userInput === previous) {
      return props.handleSubmit?.({ data: makeBreadcrumb(props.fn, values) });
    }

    if (step === "input") return setStep("task");

    if (step === "task")
      props.handleSubmit?.({ data: makeBreadcrumb(props.fn, values) });
  };

  const TaskComponent = taskComponents[props.task];
  if (!TaskComponent) return null;

  const validationSchema = getValidationSchema(props);

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      onSubmit={nextStep}
      enableReinitialize
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={validationSchema}
    >
      {({ submitForm }) => (
        <Card handleSubmit={submitForm} isValid={!isRunningTask}>
          <CardHeader
            title={props.title}
            description={props.description}
            {...(step === "input" && {
              info: props.info,
              policyRef: props.policyRef,
              howMeasured: props.howMeasured,
            })}
          />
          {step === "input" && <InitialUserInput {...props} />}
          {step === "task" && <TaskComponent {...props} />}
        </Card>
      )}
    </Formik>
  );
};

export default EnhancedTextInputComponent;
