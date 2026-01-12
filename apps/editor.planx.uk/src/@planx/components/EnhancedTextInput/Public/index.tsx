import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
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
  const [step, setStep] = useState<"input" | "task">("input");
  const isRunningTask = useIsFetching({ queryKey: [props.task] });

  const nextStep = (values: FormValues) => {
    if (step === "input") return setStep("task");
    if (step === "task")
      props.handleSubmit?.({ data: makeBreadcrumb(props.fn, values) });
  };

  const TaskComponent = taskComponents[props.task];
  if (!TaskComponent) return null;

  const validationSchema = getValidationSchema(props);

  return (
    <Formik<FormValues>
      initialValues={{
        userInput: "",
        status: "idle",
        enhanced: null,
        error: null,
      }}
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
