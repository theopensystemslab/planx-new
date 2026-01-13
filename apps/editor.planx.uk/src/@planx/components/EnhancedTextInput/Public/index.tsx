import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import type { PublicProps } from "@planx/components/shared/types";
import { makeData } from "@planx/components/shared/utils";
import {
  TextInputType,
  textInputValidationSchema,
} from "@planx/components/TextInput/model";
import { useIsFetching } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { useState } from "react";
import { object } from "yup";

import type { EnhancedTextInput, TaskComponentMap } from "../types";
import InitialUserInput from "./InitialUserInput";
import ProjectDescription from "./Tasks/ProjectDescription";

type Props = PublicProps<EnhancedTextInput>;

const taskComponents: TaskComponentMap = {
  projectDescription: ProjectDescription,
};

const EnhancedTextInputComponent = (props: Props) => {
  const [step, setStep] = useState<"input" | "task">("input");
  const isRunningTask = useIsFetching({ queryKey: [props.task] });

  const nextStep = () => {
    if (step === "input") return setStep("task");
    if (step === "task") props.handleSubmit?.(makeData(props, {}));
  };

  const TaskComponent = taskComponents[props.task];
  if (!TaskComponent) return null;

  const validationSchema = object({
    userInput: textInputValidationSchema({
      data: { ...props, type: TextInputType.Long },
      required: true,
    }),
  });

  return (
    <Formik<{ userInput: string }>
      initialValues={{ userInput: "" }}
      onSubmit={nextStep}
      enableReinitialize
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={validationSchema}
    >
      <Card handleSubmit={nextStep} isValid={!isRunningTask}>
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
    </Formik>
  );
};

export default EnhancedTextInputComponent;
